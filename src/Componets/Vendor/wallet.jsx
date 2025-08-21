import React from "react";
import { Card, Button, Container, Row, Col, Nav } from "react-bootstrap";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import Navbar from "./navbar";

const Wallet = () => {
  // Commission data
  const commission = {
    totalDue: 520,
    upiId: "vendor@upi",
  };

  // Transactions data
  const transactions = [
    {
      id: 1,
      date: "Today, 10:45 AM",
      title: "Payment Received from Order #123",
      amount: "+₹500.00",
      type: "credit",
    },
    {
      id: 2,
      date: "Yesterday, 6:30 PM",
      title: "Grocery Shopping",
      amount: "-₹300.00",
      type: "debit",
    },
    {
      id: 3,
      date: "Aug 21, 2:15 PM",
      title: "Refund from Amazon",
      amount: "+₹1,250.00",
      type: "credit",
    },
    {
      id: 4,
      date: "Aug 20, 8:45 PM",
      title: "Dinner at Italian Restaurant",
      amount: "-₹850.00",
      type: "debit",
    },
  ];

  return (
    <>
    <Navbar></Navbar>
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Wallet Header */}
            <h3 className="fw-bold">My Wallet</h3>
            <p className="text-muted">Manage your finances</p>

            {/* Balance Card */}
            <Card className="shadow-sm border-0 rounded-4 mb-4">
              <Card.Body className="p-4">
                <p className="text-muted mb-1">Available Balance</p>
                <h2 className="fw-bold">₹ 12,500.00</h2>
                <div className="d-flex gap-3 mt-3">
                  <Button
                    variant="warning"
                    className="fw-bold text-dark px-4 rounded-3"
                  >
                    + Add Money
                  </Button>
                  <Button
                    variant="outline-dark"
                    className="fw-bold px-4 rounded-3"
                  >
                     Withdraw
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Commission Section */}
            <Card className="shadow-sm border-0 rounded-4 mb-4">
              <Card.Body>
                <h5 className="fw-semibold">Commission Due</h5>
                <p className="fs-5 fw-bold text-danger">₹{commission.totalDue}</p>
                <Button
                  variant="warning"
                  className="fw-bold text-dark px-4 py-2 rounded-3"
                >
                  Pay via UPI 
                </Button>
              </Card.Body>
            </Card>

            {/* Transactions */}
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-semibold">Transactions</h5>
                
              </div>

              {transactions.map((txn) => (
                <Card
                  key={txn.id}
                  className="mb-3 border-0 shadow-sm rounded-4"
                >
                  <Card.Body className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className={`p-3 rounded-circle ${
                          txn.type === "credit"
                            ? "bg-success-subtle text-success"
                            : "bg-danger-subtle text-danger"
                        }`}
                      >
                        {txn.type === "credit" ? (
                          <FaArrowDown />
                        ) : (
                          <FaArrowUp />
                        )}
                      </div>
                      <div>
                        <p className="mb-1 fw-semibold">{txn.title}</p>
                        <small className="text-muted">{txn.date}</small>
                      </div>
                    </div>
                    <p
                      className={`fw-bold ${
                        txn.type === "credit" ? "text-success" : "text-danger"
                      } mb-0`}
                    >
                      {txn.amount}
                    </p>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </motion.div>
        </Col>
      </Row>
    </Container></> 
  );
};

export default Wallet;
