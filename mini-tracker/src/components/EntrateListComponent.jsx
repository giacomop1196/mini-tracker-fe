import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Button, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import NavbarComponent from './NavbarComponent';

const API_BASE_URL = 'http://localhost:5000';

function EntrateListComponent() {
    const [entrateData, setEntrateData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleAggiungiClick = () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setError("ID utente non trovato. Effettua nuovamente il login.");
            return;
        }
        navigate(`/entrate/aggiungi`);
    };

    const fetchEntrate = useCallback(() => {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) {
            setError('Accesso non autorizzato. Per favore, fai il login.');
            setLoading(false);
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        const API_URL = `${API_BASE_URL}/user/${userId}/revenue`;
        setLoading(true);
        setError(null);

        fetch(API_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('authToken');
                    throw new Error('Sessione scaduta. Effettua nuovamente il login.');
                }
                if (!response.ok)
                    throw new Error('Impossibile caricare le entrate.');
                return response.json();
            })
            .then(data => {
                setEntrateData(data);
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
        fetchEntrate();
    }, [fetchEntrate]);

    const handleDelete = (revenueId) => {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) {
            setError('Sessione scaduta.');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }
        if (!window.confirm('Sei sicuro di voler eliminare questa entrata?')) return;

        fetch(`${API_BASE_URL}/user/${userId}/revenue/${revenueId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('authToken');
                    throw new Error('Sessione scaduta.');
                }
                if (response.status === 204) {
                    fetchEntrate();
                } else {
                    throw new Error('Errore during l\'eliminazione.');
                }
            })
            .catch(err => setError(err.message));
    };


    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    if (loading && !entrateData) {
        return (
            <div className='sfondo'>
                <Container className="text-center">
                    <Spinner animation="border" />
                    <p>Caricamento entrate...</p>
                </Container>
            </div>
        );
    }

    if (error) {
        return (
            <div className='sfondo'>
                <Container>
                    <Alert variant="danger">{error}</Alert>
                </Container>
            </div>
        );
    }

    const entrate = entrateData ? entrateData.content : [];

    return (
        <div className='sfondo'>
            <Container>
                <Row className="justify-content-md-center">
                    <Col md={10}>
                        <Card className='mt-5 rounded-5'>
                            <Card.Header as="h3" className="d-flex justify-content-between align-items-center">
                                <span>
                                    <i className="bi bi-cash-coin me-2"></i>Tutte le Entrate
                                </span>
                                <Button
                                    variant="primary"
                                    className='rounded-5'
                                    size="sm"
                                    onClick={handleAggiungiClick}
                                >
                                    <i className="bi bi-plus-circle me-1"></i> Aggiungi Entrata
                                </Button>
                            </Card.Header>
                            <Card.Body>
                                {loading && <Spinner animation="border" size="sm" />}

                                {entrate && entrate.length > 0 ? (
                                    <ListGroup variant="flush">
                                        {entrate.map(entrata => (
                                            <ListGroup.Item key={entrata.revenueId} className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <strong>Data: {entrata.date}</strong>
                                                    <br />
                                                    <small>
                                                        Importo: {formatCurrency(entrata.amount)}
                                                    </small>

                                                </div>
                                                <div>
                                                    <Button className='rounded-5' variant="outline-danger" size="sm" onClick={() => handleDelete(entrata.revenueId)}>
                                                        <i className="bi bi-trash3"></i>  Elimina
                                                    </Button>
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                ) : (
                                    <Alert variant="info" className='rounded-5'>Nessuna entrata trovata.</Alert>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default EntrateListComponent;