import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './navbar';
import axios from 'axios';

function TechnicalNonDashboard() {
    const { id } = useParams(); 
    const [count, setCount] = useState();
    const [upcomingJobs, setUpcomingJobs] = useState([]);
    const [locationName, setLocationName] = useState("Fetching location...");
    const [distance, setDistance] = useState(null);

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    useEffect(() => {
        axios.get(`https://backend-d6mx.vercel.app/count/service/${id}`)
            .then(res => setCount(res.data))
            .catch(err => console.error(err));

        axios.get(`https://backend-d6mx.vercel.app/upcomingjobs/${id}`)
            .then(res => setUpcomingJobs(res.data))
            .catch(err => console.error(err));
    }, [id]);

    async function getCoordinatesFromCity(cityName) {
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/search?city=${cityName}&state=Telangana&country=India&format=json&addressdetails=1`);
            const cityData = response.data[0];
            if (cityData) {
                return {
                    lat: parseFloat(cityData.lat),
                    lon: parseFloat(cityData.lon)
                };
            }
        } catch (error) {
            console.error("Error getting coordinates:", error);
            return null;
        }
    }

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                    const name = res.data.address.city || res.data.address.town || res.data.address.village || "Your Area";
                    setLocationName(name);

                    const destination = await getCoordinatesFromCity("uppal");
                    if (destination) {
                        const calculatedDistance = calculateDistance(latitude, longitude, destination.lat, destination.lon);
                        setDistance(calculatedDistance);
                    }
                } catch (error) {
                    console.error("Error fetching location name", error);
                    setLocationName("Location unavailable");
                }
            }, () => setLocationName("Permission denied"));
        } else {
            setLocationName("Geolocation not supported");
        }
    }, [id]);

    return (
        <div>
            <Navbar locationName={locationName} />
            <h1 className="mt-4 mb-4 fw-bold text-primary text-center">Vendor Dashboard (ID: {id})</h1>

            <div className="container mt-4">
                <div className="row g-3">
                    {[ 
                        { title: "New Jobs", count: count?.count1, icon: "bi-briefcase-fill" },
                        { title: "Pending Jobs", count: count?.count1, icon: "bi-clock-fill" },
                        { title: "Completed Jobs", count: count?.count2, icon: "bi-check-circle-fill" },
                    ].map((item, i) => (
                        <div className="col-md-3" key={i}>
                            <div className="card text-center shadow-sm">
                                <div className="card-body">
                                    <div className="text-muted">{item.title}</div>
                                    <h3>{item.count}</h3>
                                    <i className={`bi ${item.icon} fs-3`}></i>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <h2 className="mt-5 mb-3">Upcoming Jobs</h2>

                {upcomingJobs.map((job, index) => (
                    <div className="card mb-3 shadow-sm" key={job._id}>
                        <div className="card-body">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="badge text-bg-secondary">{job.Vendorid?.Category}</span>
                                <span className="badge text-bg-warning text-dark">
                                    {new Date(job.serviceDate).toDateString()} {job.serviceTime}
                                </span>
                            </div>
                            <h5>Job at {job.address?.street}</h5>
                            <p className="text-muted mb-1">
                                {locationName} – Distance: {distance ? `${distance.toFixed(2)} km` : "Calculating..."}
                            </p>
                            <p className="mb-1">Customer Name: {job.customer?.fullName}</p>
                            <p className="fw-bold">Estimated Reward: ₹{job.totalAmount}</p>
                            <div className="d-flex gap-2">
                                <button className="btn btn-secondary">View Job</button>
                                <button className="btn btn-primary">Start Job</button>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="mt-5">
                    <h4>Performance Tracker</h4>
                    <div className="row g-3">
                        {[ 
                            { label: "Total Rewards Earned", value: "₹3,000" },
                            { label: "Bonus Earned", value: "₹300" },
                            { label: "Rating", value: <><i className="bi bi-star-fill text-warning"></i> 3.0/5.0</> }
                        ].map((item, i) => (
                            <div className="col-md-4" key={i}>
                                <div className="card text-center shadow-sm">
                                    <div className="card-body">
                                        <h4 className="mb-1">{item.value}</h4>
                                        <small className="text-muted">{item.label}</small>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h4 className="mt-4">Customer Reviews</h4>
                    {[...Array(2)].map((_, i) => (
                        <div className="card mb-3 shadow-sm" key={i}>
                            <div className="card-body">
                                <div className="d-flex align-items-center mb-2">
                                    <img src="https://randomuser.me/api/portraits/women/32.jpg" className="rounded-circle me-3" width="50" height="50" alt="Customer" />
                                    <div>
                                        {[...Array(4)].map((_, i) => (
                                            <i key={i} className="bi bi-star-fill text-warning"></i>
                                        ))}
                                        <small className="text-muted ms-2">2 days ago</small>
                                    </div>
                                </div>
                                <p className="mb-0">
                                    {i === 0
                                        ? "The service was quick and professional — highly satisfied with the electrician's work!"
                                        : "I was genuinely impressed with the technician’s punctuality and professionalism. He not only fixed the issue quickly but also explained everything clearly — highly recommended!"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TechnicalNonDashboard;
