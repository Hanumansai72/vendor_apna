import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../config";
import { socket } from "../Login/Signup/socket";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../Auth/AuthContext";
import Navbar from "../Navbar/navbar";
import Footer from "../Navbar/footer";
import axios from "axios";

export default function VendorChat() {
  const { user: authUser } = useAuth();
  const vendorId = authUser?.id;

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCustomerTyping, setIsCustomerTyping] = useState(false);
  const [customerOnlineStatus, setCustomerOnlineStatus] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  /* ---------------- LOAD VENDOR CONVERSATIONS ---------------- */
  useEffect(() => {
    if (!vendorId) return;

    api
      .get(`/api/chat/conversations/vendor/${vendorId}`)
      .then((res) => {
        setConversations(res.data);

        // Check if there's a stored conversation ID from inbox
        const storedConvoId = localStorage.getItem("activeConversationId");
        if (storedConvoId && res.data.length > 0) {
          const foundConvo = res.data.find(c => c._id === storedConvoId);
          if (foundConvo) {
            setActiveConversation(foundConvo);
            localStorage.removeItem("activeConversationId");
            return;
          }
        }

        // Default to first conversation if no stored ID
        if (res.data.length > 0 && !activeConversation) {
          setActiveConversation(res.data[0]);
        }
      })
      .catch((err) => console.error("Load conversations failed", err))
      .finally(() => setLoading(false));
  }, [vendorId]);

  /* ---------------- JOIN SOCKET ROOM & LISTEN FOR EVENTS ---------------- */
  useEffect(() => {
    if (!activeConversation?._id) return;

    socket.emit("joinConversation", activeConversation._id);

    // Listen for new messages
    const messageHandler = (msg) => {
      if (msg.conversationId === activeConversation._id) {
        setMessages((prev) => {
          if (prev.find(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    // Listen for typing events
    const typingHandler = (data) => {
      if (data.conversationId === activeConversation._id && data.userType === 'user') {
        setIsCustomerTyping(data.isTyping);
      }
    };

    // Listen for messages seen
    const seenHandler = (data) => {
      if (data.conversationId === activeConversation._id) {
        setMessages(prev => prev.map(m =>
          m.senderType === 'vendor' ? { ...m, seen: true, seenAt: data.seenAt } : m
        ));
      }
    };

    socket.on("receiveMessage", messageHandler);
    socket.on("userTyping", typingHandler);
    socket.on("messagesSeen", seenHandler);

    return () => {
      socket.off("receiveMessage", messageHandler);
      socket.off("userTyping", typingHandler);
      socket.off("messagesSeen", seenHandler);
    };
  }, [activeConversation]);

  /* ---------------- ONLINE STATUS TRACKING ---------------- */
  useEffect(() => {
    const onlineHandler = (data) => {
      setCustomerOnlineStatus(prev => ({ ...prev, [data.userId]: true }));
    };
    const offlineHandler = (data) => {
      setCustomerOnlineStatus(prev => ({ ...prev, [data.userId]: false }));
    };

    socket.on("userOnline", onlineHandler);
    socket.on("userOffline", offlineHandler);

    // Check online status for all customers in conversations
    conversations.forEach(convo => {
      if (convo.userId?._id) {
        socket.emit("checkOnline", convo.userId._id, (data) => {
          setCustomerOnlineStatus(prev => ({
            ...prev,
            [convo.userId._id]: data?.online || false
          }));
        });
      }
    });

    return () => {
      socket.off("userOnline", onlineHandler);
      socket.off("userOffline", offlineHandler);
    };
  }, [conversations]);

  /* ---------------- LOAD MESSAGES ---------------- */
  useEffect(() => {
    if (!activeConversation?._id) return;

    setMessages([]);

    api
      .get(`/api/chat/messages/${activeConversation._id}`)
      .then((res) => {
        setMessages(res.data);

        // Mark messages as seen
        socket.emit("messageSeen", {
          conversationId: activeConversation._id,
          viewerId: vendorId,
          viewerType: 'vendor'
        });
      })
      .catch((err) => console.error("Load messages failed", err));
  }, [activeConversation, vendorId]);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isCustomerTyping]);

  /* ---------------- TYPING INDICATOR ---------------- */
  const handleInputChange = (e) => {
    setInput(e.target.value);

    if (!activeConversation) return;

    socket.emit("startTyping", {
      conversationId: activeConversation._id,
      senderId: vendorId,
      senderType: "vendor"
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        conversationId: activeConversation._id,
        senderId: vendorId,
        senderType: "vendor"
      });
    }, 2000);
  };

  /* ---------------- FILE SELECTION ---------------- */
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 5;
    const maxSize = 10 * 1024 * 1024;

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    }).slice(0, maxFiles);

    setSelectedFiles(prev => [...prev, ...validFiles].slice(0, maxFiles));
    e.target.value = '';
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  /* ---------------- UPLOAD FILES TO CLOUDINARY ---------------- */
  const uploadFilesToCloudinary = async (files) => {
    const uploadedFiles = [];
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dqr7bfglk';

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default');

      try {
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress);
            }
          }
        );

        uploadedFiles.push({
          url: response.data.secure_url,
          type: file.type.startsWith('image/') ? 'image' :
            file.type.startsWith('audio/') ? 'audio' :
              file.type.startsWith('video/') ? 'video' : 'document',
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type
        });
      } catch (err) {
        console.error('Upload failed for:', file.name, err);
        alert(`Failed to upload ${file.name}. Please try again.`);
      }
    }

    return uploadedFiles;
  };

  /* ---------------- SEND MESSAGE ---------------- */
  const handleSend = async () => {
    if ((!input.trim() && selectedFiles.length === 0) || !activeConversation) return;

    socket.emit("stopTyping", {
      conversationId: activeConversation._id,
      senderId: vendorId,
      senderType: "vendor"
    });

    const messageText = input.trim();
    setInput("");

    let attachments = [];
    if (selectedFiles.length > 0) {
      setIsUploading(true);
      try {
        attachments = await uploadFilesToCloudinary(selectedFiles);
        setSelectedFiles([]);
      } catch (err) {
        console.error("File upload failed:", err);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
      setUploadProgress(0);
    }

    const tempId = Date.now().toString();
    const tempMessage = {
      _id: tempId,
      conversationId: activeConversation._id,
      senderId: vendorId,
      senderType: "vendor",
      message: messageText,
      attachments,
      messageType: attachments.length > 0 ? (messageText ? 'mixed' : 'file') : 'text',
      createdAt: new Date()
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      if (attachments.length > 0) {
        socket.emit("sendMessageWithFile", {
          conversationId: activeConversation._id,
          senderId: vendorId,
          senderType: "vendor",
          message: messageText,
          attachments
        });
      } else {
        socket.emit("sendMessage", {
          conversationId: activeConversation._id,
          senderId: vendorId,
          senderType: "vendor",
          message: messageText
        });
      }
    } catch (err) {
      console.error("Message send failed", err);
    }
  };

  /* ---------------- RENDER FILE PREVIEW ---------------- */
  const renderFilePreview = (file, index) => {
    const isImage = file.type?.startsWith('image/');
    return (
      <div key={index} className="file-preview-item">
        {isImage ? (
          <img src={URL.createObjectURL(file)} alt={file.name} />
        ) : (
          <div className="file-icon">
            <i className="bi bi-file-earmark"></i>
          </div>
        )}
        <span className="file-name">{file.name}</span>
        <button className="remove-file" onClick={() => removeFile(index)}>
          <i className="bi bi-x"></i>
        </button>
      </div>
    );
  };

  /* ---------------- RENDER MESSAGE ATTACHMENTS ---------------- */
  const renderAttachments = (attachments) => {
    if (!attachments || attachments.length === 0) return null;

    return (
      <div className="message-attachments">
        {attachments.map((att, i) => {
          if (att.type === 'image') {
            return (
              <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="attachment-image">
                <img src={att.url} alt={att.fileName} />
              </a>
            );
          }
          return (
            <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="attachment-file">
              <i className="bi bi-file-earmark-arrow-down"></i>
              <span>{att.fileName}</span>
            </a>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Navbar />

      <style>{`
        .chat-wrapper {
          height: calc(100vh - 160px);
          max-width: 1200px;
          margin: 20px auto;
          background: #fff;
          border-radius: 24px;
          display: flex;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.06);
        }
        .sidebar {
          width: 350px;
          border-right: 1px solid #f0f0f0;
          display: flex;
          flex-direction: column;
          background: #fff;
        }
        .sidebar-header {
          padding: 24px;
          border-bottom: 1px solid #f0f0f0;
        }
        .convo-list {
          flex: 1;
          overflow-y: auto;
          padding: 10px;
        }
        .convo-item {
          padding: 12px 16px;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        .convo-item:hover {
          background: #f8f9fa;
        }
        .convo-item.active {
          background: #fff9e6;
          border: 1px solid #eee;
        }
        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #fdfdfd;
        }
        .chat-header {
          padding: 16px 24px;
          background: #fff;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
        }
        .message-box {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          background: #f7f9fb;
        }
        .msg-bubble {
          max-width: 70%;
          padding: 12px 16px;
          margin-bottom: 16px;
          font-size: 0.95rem;
          line-height: 1.5;
          position: relative;
        }
        .msg-vendor {
          background: #333;
          color: #fff;
          margin-left: auto;
          border-radius: 18px 18px 4px 18px;
        }
        .msg-customer {
          background: #fff;
          color: #333;
          border-radius: 18px 18px 18px 4px;
          border: 1px solid #f0f0f0;
        }
        .chat-input-area {
          padding: 20px 24px;
          background: #fff;
          border-top: 1px solid #f0f0f0;
        }
        .vendor-input {
          border: 1px solid #eee;
          background: #f8f9fa;
          border-radius: 12px;
          padding: 12px 20px;
        }
        .vendor-input:focus {
          background: #fff;
          box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.3);
          border-color: #ffd700;
        }
        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
        }
        .status-dot.online { background: #22c55e; }
        .status-dot.offline { background: #9ca3af; }
        .typing-indicator {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          background: #fff;
          border-radius: 18px;
          border: 1px solid #f0f0f0;
          width: fit-content;
          margin-bottom: 16px;
        }
        .typing-dots {
          display: flex;
          gap: 4px;
        }
        .typing-dots span {
          width: 8px;
          height: 8px;
          background: #999;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }
        .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        .file-preview-area {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding: 10px 0;
          max-height: 100px;
          overflow-y: auto;
        }
        .file-preview-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f0f2f5;
          border-radius: 10px;
          max-width: 180px;
        }
        .file-preview-item img {
          width: 36px;
          height: 36px;
          object-fit: cover;
          border-radius: 6px;
        }
        .file-preview-item .file-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border-radius: 6px;
          font-size: 1rem;
        }
        .file-preview-item .file-name {
          font-size: 0.7rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 80px;
        }
        .file-preview-item .remove-file {
          position: absolute;
          top: -5px;
          right: -5px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #ff4444;
          color: white;
          border: none;
          font-size: 0.6rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .upload-progress {
          height: 3px;
          background: #e0e0e0;
          border-radius: 2px;
          overflow: hidden;
          margin: 8px 0;
        }
        .upload-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #ffd700, #ffb700);
          transition: width 0.3s;
        }
        .message-attachments {
          margin-top: 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .attachment-image img {
          max-width: 180px;
          max-height: 180px;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .attachment-image img:hover {
          transform: scale(1.02);
        }
        .attachment-file {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(255,255,255,0.2);
          border-radius: 6px;
          color: inherit;
          text-decoration: none;
          font-size: 0.8rem;
          transition: background 0.2s;
        }
        .msg-vendor .attachment-file {
          background: rgba(255,255,255,0.15);
        }
        .msg-vendor .attachment-file:hover {
          background: rgba(255,255,255,0.25);
        }
        .msg-customer .attachment-file {
          background: rgba(0,0,0,0.05);
        }
        .msg-customer .attachment-file:hover {
          background: rgba(0,0,0,0.1);
        }
        @media (max-width: 992px) {
          .sidebar { width: 80px; }
          .sidebar-header h5, .convo-item .convo-info { display: none; }
          .convo-item { justify-content: center; padding: 12px; }
        }
      `}</style>

      <div className="container-fluid px-md-4 flex-grow-1">
        <div className="chat-wrapper">
          {/* SIDEBAR */}
          <div className="sidebar">
            <div className="sidebar-header">
              <h5 className="fw-bold mb-0">Direct Messages</h5>
            </div>
            <div className="convo-list">
              {conversations.map((c) => (
                <div
                  key={c._id}
                  className={`convo-item ${activeConversation?._id === c._id ? "active" : ""}`}
                  onClick={() => setActiveConversation(c)}
                >
                  <div className="position-relative">
                    <img
                      src={c.userId?.Profile_Image || `https://ui-avatars.com/api/?name=${c.userId?.Full_Name || 'C'}&background=random`}
                      className="rounded-circle me-3"
                      width="44"
                      height="44"
                      style={{ objectFit: 'cover' }}
                      alt=""
                    />
                    <span
                      className={`status-dot position-absolute ${customerOnlineStatus[c.userId?._id] ? 'online' : 'offline'}`}
                      style={{ bottom: 2, right: 14, border: '2px solid #fff' }}
                    ></span>
                  </div>
                  <div className="convo-info overflow-hidden">
                    <div className="fw-bold text-truncate" style={{ fontSize: '0.9rem' }}>
                      {c.userId?.Full_Name || "Customer"}
                    </div>
                    <small className="text-muted text-truncate d-block">
                      {c.lastMessage || "No messages yet"}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MAIN CHAT */}
          <div className="chat-main">
            {activeConversation ? (
              <>
                <div className="chat-header">
                  <div className="position-relative">
                    <img
                      src={activeConversation.userId?.Profile_Image || `https://ui-avatars.com/api/?name=${activeConversation.userId?.Full_Name || 'C'}&background=random`}
                      className="rounded-circle me-3"
                      width="40"
                      height="40"
                      alt=""
                    />
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-0 fw-bold">{activeConversation.userId?.Full_Name || "Customer"}</h6>
                    <div className="d-flex align-items-center gap-2">
                      <span className={`status-dot ${customerOnlineStatus[activeConversation.userId?._id] ? 'online' : 'offline'}`}></span>
                      <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {customerOnlineStatus[activeConversation.userId?._id] ? 'Online now' : 'Offline'}
                      </small>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-light rounded-circle"><i className="bi bi-info-circle"></i></button>
                  </div>
                </div>

                <div ref={scrollRef} className="message-box d-flex flex-column">
                  <AnimatePresence>
                    {messages.map((m, i) => (
                      <motion.div
                        key={m._id || i}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`msg-bubble ${m.senderType === "vendor" ? "msg-vendor" : "msg-customer"}`}
                      >
                        {m.message && <div style={{ wordBreak: 'break-word' }}>{m.message}</div>}
                        {renderAttachments(m.attachments)}
                        <div className={`mt-1 text-end ${m.senderType === "vendor" ? "text-light" : "text-muted"}`} style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {m.senderType === "vendor" && (
                            <i className={`bi ${m.seen ? 'bi-check2-all' : 'bi-check2'} ms-1`}></i>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Typing Indicator */}
                  {isCustomerTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="typing-indicator"
                    >
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <span className="ms-2 text-muted" style={{ fontSize: '0.8rem' }}>typing...</span>
                    </motion.div>
                  )}
                </div>

                <div className="chat-input-area">
                  {/* File Preview */}
                  {selectedFiles.length > 0 && (
                    <div className="file-preview-area">
                      {selectedFiles.map((file, index) => renderFilePreview(file, index))}
                    </div>
                  )}

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="upload-progress">
                      <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  )}

                  <div className="d-flex align-items-center gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      multiple
                      accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                      style={{ display: 'none' }}
                    />
                    <button
                      className="btn btn-link link-dark"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <i className="bi bi-paperclip fs-5"></i>
                    </button>
                    <div className="flex-grow-1">
                      <input
                        className="form-control vendor-input shadow-none"
                        placeholder="Write a message..."
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                        disabled={isUploading}
                      />
                    </div>
                    <button
                      className={`btn btn-warning px-4 fw-bold rounded-3 shadow-sm ${(!input.trim() && selectedFiles.length === 0) || isUploading ? 'opacity-50' : ''}`}
                      onClick={handleSend}
                      disabled={(!input.trim() && selectedFiles.length === 0) || isUploading}
                    >
                      Send <i className="bi bi-send-fill ms-1"></i>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                <i className="bi bi-chat-left-dots" style={{ fontSize: '4rem' }}></i>
                <p className="mt-3">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
