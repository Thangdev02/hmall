import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {

    Award,
    Calendar,
    CashStack,
    BoxSeamFill,
    CheckCircleFill,
    GraphUp
} from 'react-bootstrap-icons';
import { getOrdersByShop } from '../../api/oder';
import './OrderStatistics.css'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const OrderStatistics = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // eslint-disable-next-line no-unused-vars
    const [orderData, setOrderData] = useState([]); // ✅ Sửa dòng này - thêm orderData
    const [statistics, setStatistics] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        paidOrders: 0,
        completedOrders: 0,
        monthlyRevenue: [],
        statusBreakdown: {},
        revenueGrowth: 0
    });

    const token = localStorage.getItem('token');

    // Fetch all orders để tính thống kê
    const fetchAllOrders = async () => {
        try {
            setLoading(true);
            // Lấy tất cả orders (có thể cần call nhiều lần nếu có pagination)
            const response = await getOrdersByShop({
                pageNumber: 1,
                pageSize: 1000, // Lấy nhiều để có đủ data thống kê
                filter: ''
            }, token);

            if (response.statusCode === 200) {
                const orders = response.data.items || [];
                setOrderData(orders);
                calculateStatistics(orders);
            } else {
                setError('Không thể tải dữ liệu thống kê');
            }
        } catch (err) {
            setError('Đã có lỗi xảy ra khi tải dữ liệu');
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    // Tính toán thống kê
    const calculateStatistics = (orders) => {
        const paidOrders = orders.filter(order => order.status === 'PAID' || order.status === 'Paid');
        const completedOrders = orders.filter(order => order.status === 'Completed');

        // Tổng doanh thu từ các đơn đã thanh toán
        const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmounts, 0);

        // Thống kê theo trạng thái
        const statusBreakdown = orders.reduce((acc, order) => {
            const status = order.status;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        // Doanh thu theo tháng (6 tháng gần nhất)
        const monthlyRevenue = calculateMonthlyRevenue(paidOrders);

        // Tính tăng trưởng (so với tháng trước)
        const revenueGrowth = calculateGrowthRate(monthlyRevenue);

        setStatistics({
            totalRevenue,
            totalOrders: orders.length,
            paidOrders: paidOrders.length,
            completedOrders: completedOrders.length,
            monthlyRevenue,
            statusBreakdown,
            revenueGrowth
        });
    };

    // Tính doanh thu theo tháng
    const calculateMonthlyRevenue = (paidOrders) => {
        const months = [];
        const now = new Date();

        // Tạo 6 tháng gần nhất
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                month: date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
                revenue: 0,
                orders: 0
            });
        }

        // Tính doanh thu cho từng tháng
        paidOrders.forEach(order => {
            const orderDate = new Date(order.createdDate);
            const monthIndex = months.findIndex(m => {
                const [monthName, year] = m.month.split(' ');
                const monthNumber = getMonthNumber(monthName);
                return orderDate.getMonth() === monthNumber &&
                    orderDate.getFullYear() === parseInt(year);
            });

            if (monthIndex !== -1) {
                months[monthIndex].revenue += order.totalAmounts;
                months[monthIndex].orders += 1;
            }
        });

        return months;
    };

    // Convert month name to number
    const getMonthNumber = (monthName) => {
        const months = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6',
            'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
        return months.indexOf(monthName);
    };

    // Tính tỷ lệ tăng trưởng
    const calculateGrowthRate = (monthlyData) => {
        if (monthlyData.length < 2) return 0;

        const currentMonth = monthlyData[monthlyData.length - 1].revenue;
        const previousMonth = monthlyData[monthlyData.length - 2].revenue;

        if (previousMonth === 0) return currentMonth > 0 ? 100 : 0;
        return ((currentMonth - previousMonth) / previousMonth * 100);
    };

    useEffect(() => {
        fetchAllOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Chart configurations
    const revenueChartData = {
        labels: statistics.monthlyRevenue.map(item => item.month),
        datasets: [
            {
                label: 'Doanh thu',
                data: statistics.monthlyRevenue.map(item => item.revenue),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            },
        ],
    };

    const statusChartData = {
        labels: Object.keys(statistics.statusBreakdown).map(status => {
            const statusLabels = {
                'WaitForPayment': 'Chờ thanh toán',
                'PAID': 'Đã thanh toán',
                'Paid': 'Đã thanh toán',
                'Cancelled': 'Đã hủy',
                'Completed': 'Hoàn thành'
            };
            return statusLabels[status] || status;
        }),
        datasets: [
            {
                data: Object.values(statistics.statusBreakdown),
                backgroundColor: [
                    '#ffc107',
                    '#28a745',
                    '#dc3545',
                    '#17a2b8',
                    '#6f42c1'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            },
        ],
    };

    const orderCountChartData = {
        labels: statistics.monthlyRevenue.map(item => item.month),
        datasets: [
            {
                label: 'Số đơn hàng',
                data: statistics.monthlyRevenue.map(item => item.orders),
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        if (context.dataset.label === 'Doanh thu') {
                            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                        }
                        return `${context.dataset.label}: ${context.parsed.y}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    if (loading) {
        return (
            <div className="text-center py-4">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Đang tải thống kê...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <div className="order-statistics">
            {/* Statistics Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card >
                        <Card.Body className="text-center">
                            <div className="stat-icon">
                                <CashStack size={32} />
                            </div>
                            <h3 className="stat-value">{formatCurrency(statistics.totalRevenue)}</h3>
                            <p className="stat-label">Tổng doanh thu</p>

                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="stat-card orders-card">
                        <Card.Body className="text-center">
                            <div className="stat-icon">
                                <BoxSeamFill size={32} />
                            </div>
                            <h3 className="stat-value">{statistics.totalOrders}</h3>
                            <p className="stat-label">Tổng đơn hàng</p>
                            <small className="text-muted">Tất cả trạng thái</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="stat-card paid-card">
                        <Card.Body className="text-center">
                            <div className="stat-icon">
                                <CheckCircleFill size={32} />
                            </div>
                            <h3 className="stat-value">{statistics.paidOrders}</h3>
                            <p className="stat-label">Đã thanh toán</p>
                            <small className="text-muted">
                                {statistics.totalOrders > 0 ?
                                    `${((statistics.paidOrders / statistics.totalOrders) * 100).toFixed(1)}%`
                                    : '0%'
                                }
                            </small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="stat-card completed-card">
                        <Card.Body className="text-center">
                            <div className="stat-icon">
                                <Award size={32} />
                            </div>
                            <h3 className="stat-value">{statistics.completedOrders}</h3>
                            <p className="stat-label">Hoàn thành</p>
                            <small className="text-muted">
                                {statistics.totalOrders > 0 ?
                                    `${((statistics.completedOrders / statistics.totalOrders) * 100).toFixed(1)}%`
                                    : '0%'
                                }
                            </small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row>
                <Col md={8}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">
                                <Calendar className="me-2" />
                                Doanh thu 6 tháng gần nhất
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Line data={revenueChartData} options={chartOptions} />
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">Trạng thái đơn hàng</h5>
                        </Card.Header>
                        <Card.Body>
                            <Doughnut
                                data={statusChartData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                        },
                                    },
                                }}
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={12}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">
                                <BoxSeamFill className="me-2" />
                                Số lượng đơn hàng theo tháng
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Bar data={orderCountChartData} options={chartOptions} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default OrderStatistics;