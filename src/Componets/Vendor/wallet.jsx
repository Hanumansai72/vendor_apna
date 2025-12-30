import React, { useEffect, useState } from "react";
import { Card, Button, Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import axios from "axios";
import API_BASE_URL from "../../config";
import Footer from "../Navbar/footer";

const Wallet = () => {
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    async function fetchWallet() {
      try {
        const vendorId = localStorage.getItem("vendorId"); // stored at login
        const res = await axios.get(`${API_BASE_URL}/wallet/${vendorId}`);
        setWallet(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchWallet();
  }, []);

  if (!wallet) return <p className="text-center mt-5">Loading wallet...</p>;

  return (
    <>
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="fw-bold">My Wallet</h3>
              <p className="text-muted">Manage your finances</p>

              {/* Balance Card */}
              <Card className="shadow-sm border-0 rounded-4 mb-4">
                <Card.Body className="p-4">
                  <p className="text-muted mb-1">Available Balance</p>
                  <h2 className="fw-bold">₹ {wallet.balance}</h2>
                  <div className="d-flex gap-3 mt-3">
                    <Button variant="warning" className="fw-bold text-dark px-4 rounded-3">
                      + Add Money
                    </Button>
                    <Button variant="outline-dark" className="fw-bold px-4 rounded-3">
                      Withdraw
                    </Button>
                  </div>
                </Card.Body>
              </Card>

              {/* Commission Section */}
              <Card className="shadow-sm border-0 rounded-4 mb-4">
                <Card.Body>
                  <h5 className="fw-semibold">Commission Due</h5>
                  <p className="fs-5 fw-bold text-danger">₹{wallet.commissionDue}</p>
                  <Button variant="warning" className="fw-bold text-dark px-4 py-2 rounded-3">
                    Pay via UPI
                  </Button>
                </Card.Body>
              </Card>

              {/* Transactions */}
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-semibold">Transactions</h5>
                </div>

                {wallet.transactions.map((txn) => (
                  <Card key={txn._id} className="mb-3 border-0 shadow-sm rounded-4">
                    <Card.Body className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className={`p-3 rounded-circle ${txn.type === "credit"
                              ? "bg-success-subtle text-success"
                              : "bg-danger-subtle text-danger"
                            }`}
                        >
                          {txn.type === "credit" ? <FaArrowDown /> : <FaArrowUp />}
                        </div>
                        <div>
                          <p className="mb-1 fw-semibold">{txn.description}</p>
                          <small className="text-muted">
                            {new Date(txn.date).toLocaleString()}
                          </small>
                        </div>
                      </div>
                      <p
                        className={`fw-bold ${txn.type === "credit" ? "text-success" : "text-danger"
                          } mb-0`}
                      >
                        {txn.type === "credit" ? "+" : "-"}₹{txn.amount}
                      </p>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </motion.div>
          </Col>
        </Row>
      </Container>
      <Footer></Footer>
    </>
  );
};

export default Wallet;
