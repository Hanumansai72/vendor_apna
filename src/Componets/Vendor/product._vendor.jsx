import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const id = localStorage.getItem("vendorId");

const dataDay = [
  { name: '12AM', sales: 200 },
  { name: '6AM', sales: 800 },
  { name: '12PM', sales: 1500 },
  { name: '6PM', sales: 1000 },
];

const dataWeek = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

const dataMonth = [
  { name: 'Week 1', sales: 12000 },
  { name: 'Week 2', sales: 15000 },
  { name: 'Week 3', sales: 10000 },
  { name: 'Week 4', sales: 18000 },
];

function Product() {
  const [view, setView] = useState('week');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`https://backend-d6mx.vercel.app/wow`);
        const allOrders = res.data || {};
        setOrders(allOrders.all || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setOrders([]);
      }
    };
    fetchOrder();
  }, []);

  const getData = () => {
    switch (view) {
      case 'day': return dataDay;
      case 'month': return dataMonth;
      default: return dataWeek;
    }
  };

  return (
    <div>
      <Navbar
        homeLabel="Home"
        homeUrl={`/Product/${id}`}
        jobsLabel="Products"
        jobsUrl={`/product/${id}/ViewProduct`}
        historyLabel="New Orders"
        historyUrl={`/product/${id}/order`}
        earningsLabel="Order History"
        earningsUrl={`/product/${id}/order/history`}
      />

      <div className="container mt-4">
  <div className="row">
    <div className="col-md-3">
      <div className="card text-white bg-primary mb-3">
        <div className="card-body d-flex align-items-center">
          <i className="bi bi-cart-fill fs-2 me-3"></i>
          <div>
            <h6 className="card-title mb-1">Total Orders</h6>
            <p className="card-text fs-5 mb-0">{orders.length}</p>
          </div>
        </div>
      </div>
    </div>

    <div className="col-md-3">
      <div className="card text-white bg-success mb-3">
        <div className="card-body d-flex align-items-center">
          <i className="bi bi-box-seam fs-2 me-3"></i>
          <div>
            <h6 className="card-title mb-1">Delivered</h6>
            <p className="card-text fs-5 mb-0">
              {orders.filter(o => o.orderStatus?.toLowerCase() === 'delivered').length}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div className="col-md-3">
      <div className="card text-white bg-warning mb-3">
        <div className="card-body d-flex align-items-center">
          <i className="bi bi-hourglass-split fs-2 me-3"></i>
          <div>
            <h6 className="card-title mb-1">Pending</h6>
            <p className="card-text fs-5 mb-0">
              {orders.filter(o => o.orderStatus?.toLowerCase() === 'pending').length}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div className="col-md-3">
      <div className="card text-white bg-danger mb-3">
        <div className="card-body d-flex align-items-center">
          <i className="bi bi-x-octagon-fill fs-2 me-3"></i>
          <div>
            <h6 className="card-title mb-1">Cancelled</h6>
            <p className="card-text fs-5 mb-0">
              {orders.filter(o => o.orderStatus?.toLowerCase() === 'cancelled').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

      {/* Chart Section */}
      <div className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold">Overall Sales Analytics</h5>
          <div>
            <button onClick={() => setView('day')} className={`btn btn-sm ${view === 'day' ? 'btn-primary' : 'btn-outline-primary'} me-1`}>Day</button>
            <button onClick={() => setView('week')} className={`btn btn-sm ${view === 'week' ? 'btn-primary' : 'btn-outline-primary'} me-1`}>Week</button>
            <button onClick={() => setView('month')} className={`btn btn-sm ${view === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}>Month</button>
          </div>
        </div>
        <div style={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#007bff" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="container mb-5">
        <h5 className="fw-bold mb-3">Recent Orders</h5>
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead className="table-light">
              <tr>
                <th>Order ID</th>
                <th>Product Name</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted">No orders found.</td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <tr key={index}>
                    <td>{order._id || 'N/A'}</td>
                    <td>{order.productName || 'N/A'}</td>
                    <td>{order.customerId || 'N/A'}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge bg-${getStatusBadgeColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td>₹{order.totalAmount}</td>
                    <td><a href={`/order/${order._id}`}>View Details</a></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Utility function to get status color
function getStatusBadgeColor(status) {
  switch ((status || '').toLowerCase()) {
    case 'pending': return 'warning';
    case 'delivered': return 'success';
    case 'cancelled': return 'danger';
    default: return 'secondary';
  }
}

export default Product;
