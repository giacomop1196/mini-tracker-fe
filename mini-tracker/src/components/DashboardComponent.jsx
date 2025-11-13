import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Registrazione componenti Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const API_BASE_URL = 'http://localhost:5000';

function DashboardComponent() {
    const [summaryData, setSummaryData] = useState(null);
    const [lineChartData, setLineChartData] = useState(null);
    const [doughnutChartData, setDoughnutChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [adminStats, setAdminStats] = useState(null);
    const [lockedUsersStats, setLockedUsersStats] = useState(null);
    const [globalEconomyStats, setGlobalEconomyStats] = useState(null);

    const userRole = localStorage.getItem('userRole');

    // formattare la valuta
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    const processData = (revenues = [], expenses = []) => {
        // Calcolo Totali per le Card 
        const totalRevenue = revenues.reduce((acc, r) => acc + (r.amount || 0), 0);
        const totalExpense = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
        const availableBalance = totalRevenue - totalExpense;
        setSummaryData({ totalRevenue, totalExpense, availableBalance });

        // Preparazione Dati Grafico a Linee (per Mese) 
        const monthlyData = {};

        revenues.forEach(r => {
            const month = r.date.substring(0, 7);
            if (!monthlyData[month]) monthlyData[month] = { revenue: 0, expense: 0 };
            monthlyData[month].revenue += r.amount;
        });

        expenses.forEach(e => {
            const month = e.date.substring(0, 7);
            if (!monthlyData[month]) monthlyData[month] = { revenue: 0, expense: 0 };
            monthlyData[month].expense += e.amount;
        });

        const sortedMonths = Object.keys(monthlyData).sort();

        setLineChartData({
            labels: sortedMonths,
            datasets: [
                {
                    label: 'Entrate',
                    data: sortedMonths.map(month => monthlyData[month].revenue),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                },
                {
                    label: 'Spese',
                    data: sortedMonths.map(month => monthlyData[month].expense),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                },
            ],
        });

        // Dati Grafico a Ciambella (Spese per Tipo)
        const expenseTypeData = {};

        expenses.forEach(e => {
            const type = e.type || 'Non categorizzato';
            if (!expenseTypeData[type]) expenseTypeData[type] = 0;
            expenseTypeData[type] += e.amount;
        });

        setDoughnutChartData({
            labels: Object.keys(expenseTypeData),
            datasets: [
                {
                    label: 'Spese per Tipo',
                    data: Object.values(expenseTypeData),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)',
                        'rgba(255, 159, 64, 0.8)',
                    ],
                },
            ],
        });
    };

    // FUNZIONE PER I DATI ADMIN
    const fetchAdminStats = useCallback(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Accesso non autorizzato.');
            setLoading(false);
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        const headers = { 'Authorization': `Bearer ${token}` };
        setLoading(true);
        setError(null);

        // 1. Prima chiamata: Totale Utenti
        fetch(`${API_BASE_URL}/user/stats/total`, { headers })
            .then(res => {
                if (!res.ok) throw new Error('Errore caricamento totale utenti');
                return res.json();
            })
            .then(totalData => {
                setAdminStats(totalData); // { totalUsers: 10 }

                // 2. Seconda chiamata: Utenti Bloccati
                return fetch(`${API_BASE_URL}/user/stats/locked`, { headers });
            })
            .then(res => {
                if (!res.ok) throw new Error('Errore caricamento utenti bloccati');
                return res.json();
            })
            .then(lockedData => {
                setLockedUsersStats(lockedData); // { totalLocked: 1 }

                // 3. Terza chiamata: Economia Globale
                return fetch(`${API_BASE_URL}/user/stats/global-economy`, { headers });
            })
            .then(res => {
                if (!res.ok) throw new Error('Errore caricamento dati economia');
                return res.json();
            })
            .then(economyData => {
                setGlobalEconomyStats(economyData); // { globalRevenue: ..., globalExpenses: ... }
            })
            .catch(err => {
                setError(err.message);
                if (err.message.includes('Sessione scaduta')) {
                    localStorage.clear();
                    setTimeout(() => navigate('/login'), 2000);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }, [navigate]);


    const fetchDashboardData = useCallback(() => {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
            setError('Accesso non autorizzato. Per favore, fai il login.');
            setLoading(false);
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        setLoading(true);
        setError(null);

        const revenueUrl = `${API_BASE_URL}/user/${userId}/revenue?size=1000&sort=date,asc`;
        const expenseUrl = `${API_BASE_URL}/user/${userId}/expense?size=1000&sort=date,asc`;

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };

        Promise.all([
            fetch(revenueUrl, { headers }),
            fetch(expenseUrl, { headers })
        ])
            .then(async ([revenueRes, expenseRes]) => {
                if (revenueRes.status === 401 || revenueRes.status === 403 || expenseRes.status === 401 || expenseRes.status === 403) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userId');
                    throw new Error('Sessione scaduta. Effettua nuovamente il login.');
                }

                // Gestione Errori
                if (!revenueRes.ok) throw new Error('Impossibile caricare le entrate.');
                if (!expenseRes.ok) throw new Error('Impossibile caricare le spese.');

                const revenueData = await revenueRes.json();
                const expenseData = await expenseRes.json();
                processData(revenueData.content, expenseData.content);
            })
            .catch(err => {
                setError(err.message);
                if (err.message.includes('Sessione scaduta')) {
                    setTimeout(() => navigate('/login'), 2000);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }, [navigate]);

    useEffect(() => {
        if (userRole === 'USER') {
            fetchDashboardData();
        } else if (userRole === 'ADMIN') {
            // Chiama la funzione per l'admin
            fetchAdminStats();
        } else {
            setError('Ruolo utente non valido. Effettua il login.');
            localStorage.clear();
            setLoading(false);
            setTimeout(() => navigate('/login'), 2000);
        }
    }, [userRole, fetchDashboardData, fetchAdminStats, navigate]);

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" />
                <p>Caricamento dashboard...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    // Opzioni per i grafici
    const lineChartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Andamento Entrate vs Spese' },
        },
    };

    const doughnutChartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Composizione Spese' },
        },
    };

    return (
        <div className='sfondo'>
            <Container fluid className="p-5">

                {userRole === 'ADMIN' && (
                    <>
                        
                        <Row className="mb-4 d-flex justify-content-center">
                            {/* Card Totale Utenti */}
                            {adminStats && (
                                <Col md={4} className="mb-3">
                                    <Card className="shadow-sm rounded-5 text-center bg-light">
                                        <Card.Body>
                                            <Card.Title as="h6" className="text-primary text-uppercase">
                                                <i className="bi bi-people-fill me-2"></i>Totale Utenti
                                            </Card.Title>
                                            <h3 className="text-primary">{adminStats.totalUsers}</h3>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            )}
                            {/* Card Utenti Bloccati */}
                            {lockedUsersStats && (
                                <Col md={4} className="mb-3">
                                    <Card className="shadow-sm rounded-5 text-center bg-light">
                                        <Card.Body>
                                            <Card.Title as="h6" className="text-danger text-uppercase">
                                                <i className="bi bi-lock-fill me-2"></i>Utenti Bloccati
                                            </Card.Title>
                                            <h3 className="text-danger">{lockedUsersStats.totalLocked}</h3>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            )}
                        </Row>

                        {/* Card Economia Globale */}
                        {globalEconomyStats && (
                            <Row className="mb-4 d-flex justify-content-center">
                                <Col md={4} className="mb-3">
                                    <Card className="shadow-sm rounded-5 text-center">
                                        <Card.Body>
                                            <Card.Title as="h6" className="text-success text-uppercase">
                                                <i className="bi bi-graph-up-arrow me-2"></i>Entrate Globali
                                            </Card.Title>
                                            <h3 className="text-success">{formatCurrency(globalEconomyStats.globalRevenue)}</h3>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4} className="mb-3">
                                    <Card className="shadow-sm rounded-5 text-center">
                                        <Card.Body>
                                            <Card.Title as="h6" className="text-danger text-uppercase">
                                                <i className="bi bi-graph-down-arrow me-2"></i>Spese Globali
                                            </Card.Title>
                                            <h3 className="text-danger">{formatCurrency(globalEconomyStats.globalExpenses)}</h3>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        )}
                    </>
                )}

                {userRole === 'USER' && (
                    <>
                        {/* Card dei Totali */}
                        {summaryData && (
                            <Row className="mb-4">
                                <Col md={4}>
                                    <Card className="shadow-sm rounded-5 text-center">
                                        <Card.Body>
                                            <Card.Title as="h6" className="text-success text-uppercase">
                                                <i className="bi bi-arrow-up-circle me-2"></i>Totale Entrate
                                            </Card.Title>
                                            <h3 className="text-success">{formatCurrency(summaryData.totalRevenue)}</h3>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    <Card className="shadow-sm rounded-5 text-center">
                                        <Card.Body>
                                            <Card.Title as="h6" className="text-danger text-uppercase">
                                                <i className="bi bi-arrow-down-circle me-2"></i>Totale Spese
                                            </Card.Title>
                                            <h3 className="text-danger">{formatCurrency(summaryData.totalExpense)}</h3>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    <Card className="shadow-sm rounded-5 text-center bg-light">
                                        <Card.Body>
                                            <Card.Title as="h6" className="text-primary text-uppercase">
                                                <i className="bi bi-wallet2 me-2"></i>Saldo Disponibile
                                            </Card.Title>
                                            <h3 className="text-primary">{formatCurrency(summaryData.availableBalance)}</h3>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        )}

                        {/* Grafici */}
                        <Row>
                            <Col lg={8} className="mb-4">
                                <Card className="shadow-sm rounded-5">
                                    <Card.Body>
                                        {lineChartData ? (
                                            <Line options={lineChartOptions} data={lineChartData} />
                                        ) : (
                                            <Alert variant="info">Dati per il grafico andamento non sufficienti.</Alert>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col lg={4} className="mb-4">
                                <Card className="shadow-sm rounded-5">
                                    <Card.Body>
                                        {doughnutChartData ? (
                                            <Doughnut options={doughnutChartOptions} data={doughnutChartData} />
                                        ) : (
                                            <Alert variant="info">Nessuna spesa da categorizzare.</Alert>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </>
                )}
            </Container>
        </div>
    );
}

export default DashboardComponent;