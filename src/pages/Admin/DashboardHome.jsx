// src/pages/Dashboard.jsx
import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from "chart.js";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { ArrowRight } from "react-bootstrap-icons";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const Dashboard = () => {
  const financeData = {
    labels: ["Dec", "Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Income",
        data: [8, 6, 9, 7, 10, 12],
        backgroundColor: "#4B9CE2",
        borderRadius: 8,
      },
    ],
  };

  const geoUrl =
    "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

  return (
    <Container fluid className="p-4" style={{ backgroundColor: "#fafafa" }}>
      <Row>
        {/* Visits card */}
        <Col md={8}>
          <Card
            className="p-4 text-white border-0"
            style={{
              background: "linear-gradient(135deg, #5cb3ff, #9c8bff)",
              borderRadius: "20px",
            }}
          >
            <Row>
              <Col>
                <h1>824</h1>
                <p>Popularity: 93</p>
                <p>General rate: 4.7</p>
                <Button
                  variant="light"
                  className="mt-3 d-flex align-items-center gap-2"
                  style={{ borderRadius: "30px", fontWeight: "500" }}
                >
                  VIEW FULL STATISTIC <ArrowRight />
                </Button>
              </Col>
              <Col className="d-flex justify-content-end align-items-center">
                {/* Illustration thay avatar */}
                <img
                  src="https://illustrations.popsy.co/gray/laptop-coffee.png"
                  alt="illustration"
                  style={{ width: "200px" }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Popularity card */}
        <Col md={4}>
          <Card
            className="p-4 border-0"
            style={{
              background: "linear-gradient(135deg, #ffb47a, #ff8c6b)",
              borderRadius: "20px",
              color: "#fff",
            }}
          >
            <h2>87</h2>
            <p className="mb-2">Popularity rate</p>
            <small>
              Your rate has increased because of your recent update activity.{" "}
              <b>Keep moving</b> forward!
            </small>
            <Button variant="light" className="mt-3" style={{ borderRadius: "30px" }}>
              Learn insights <ArrowRight />
            </Button>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        {/* Finance performance */}
        <Col md={4}>
          <Card className="p-3" style={{ borderRadius: "16px" }}>
            <h6>Finance Performance</h6>
            <h3>$ 12,841</h3>
            <p className="text-muted">Monthly income</p>
            <Bar data={financeData} options={{ plugins: { legend: { display: false } } }} />
          </Card>
        </Col>

        {/* Top performers */}
        <Col md={4}>
          <Card className="p-3" style={{ borderRadius: "16px" }}>
            <h6>Top performers</h6>
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="d-flex align-items-center gap-2">
                <img
                  src="https://randomuser.me/api/portraits/women/44.jpg"
                  alt="Bessie"
                  className="rounded-circle"
                  width={40}
                />
                <div>
                  <p className="m-0">Bessie Cooper</p>
                  <small className="text-success">Online</small>
                </div>
              </div>
              <span>4.3</span>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="d-flex align-items-center gap-2">
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="Albert"
                  className="rounded-circle"
                  width={40}
                />
                <div>
                  <p className="m-0">Albert Flores</p>
                  <small className="text-success">Online</small>
                </div>
              </div>
              <span>4.7</span>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="d-flex align-items-center gap-2">
                <img
                  src="https://randomuser.me/api/portraits/men/22.jpg"
                  alt="Guy"
                  className="rounded-circle"
                  width={40}
                />
                <div>
                  <p className="m-0">Guy Hawkins</p>
                  <small className="text-muted">2 minutes ago</small>
                </div>
              </div>
              <span>4.4</span>
            </div>
          </Card>
        </Col>

        {/* Targeting by region */}
        <Col md={4}>
          <Card className="p-3" style={{ borderRadius: "16px" }}>
            <h6>Targeting by region</h6>
            <p>
              Poland <span className="badge bg-primary">23.05%</span>{" "}
              <b style={{ marginLeft: "8px" }}>41.7</b>
            </p>
            <div style={{ height: "200px" }}>
              <ComposableMap projection="geoMercator">
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        style={{
                          default: { fill: "#EEE", outline: "none" },
                          hover: { fill: "#4B9CE2", outline: "none" },
                          pressed: { fill: "#4B9CE2", outline: "none" },
                        }}
                      />
                    ))
                  }
                </Geographies>
                <Marker coordinates={[19.1451, 51.9194]}>
                  <circle r={8} fill="#FF5533" />
                </Marker>
              </ComposableMap>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
