import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Button, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000';

function UsciteListComponent() {
    const [usciteData, setUsciteData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleAggiungiClick = () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setError("ID utente non trovato. Effettua nuovamente il login.");
            return;
        }
        navigate(`/uscite/aggiungi`);
    };

    const fetchUscite = useCallback(() => {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) {
            setError('Accesso non autorizzato. Per favore, fai il login.');
            setLoading(false);
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        const API_URL = `${API_BASE_URL}/user/${userId}/expense`; 
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
                    throw new Error('Impossibile caricare le uscite.');
                return response.json();
            })
            .then(data => {
                setUsciteData(data);
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
        fetchUscite();
    }, [fetchUscite]);

    const handleDelete = (expenseId) => {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) {
            setError('Sessione scaduta.');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }
        if (!window.confirm('Sei sicuro di voler eliminare questa uscita?')) return;

        fetch(`${API_BASE_URL}/user/${userId}/expense/${expenseId}`, { 
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('authToken');
                    throw new Error('Sessione scaduta.');
                }
                if (response.status === 204) {
                    fetchUscite();
                } else {
                    throw new Error('Errore during l\'eliminazione.');
                }
            })
            .catch(err => setError(err.message));
    };


    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    if (loading && !usciteData) {
        return (
            <div className='sfondo'>
                <Container className="text-center">
                    <Spinner animation="border" />
                    <p>Caricamento uscite...</p>
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

    const uscite = usciteData ? usciteData.content : [];

    return (
        <div className='sfondo'>
            <Container>
                <Row className="justify-content-md-center">
                    <Col md={10}>
                        <Card className='mt-5 rounded-5'>
                            <Card.Header as="h3" className="d-flex justify-content-between align-items-center">
                                <span>
                                    <i className="bi bi-credit-card-2-front me-2"></i>Tutte le Uscite
                                </span>
                                <Button
                                    variant="primary"
                                    className='rounded-5'
                                    size="sm"
                                    onClick={handleAggiungiClick}
                                >
                                    <i className="bi bi-plus-circle me-1"></i> Aggiungi Uscita
                                </Button>
                            </Card.Header>
                            <Card.Body>
                                {loading && <Spinner animation="border" size="sm" />}

                                {uscite && uscite.length > 0 ? (
                                    <ListGroup variant="flush">
                                        {uscite.map(uscita => (
                                            <ListGroup.Item key={uscita.expenseId} className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <strong>Data: {uscita.date}</strong>
                                                    <br />
                                                    <small className='me-3'>
                                                        Importo: {formatCurrency(uscita.amount)}
                                                    </small>
                                                     <small>
                                                        Tipo: <strong>{uscita.type}</strong>
                                                    </small>
                                                </div>
                                                <div>
                                                    <Button className='rounded-5' variant="outline-danger" size="sm" onClick={() => handleDelete(uscita.expenseId)}>
                                                        <i className="bi bi-trash3"></i>  Elimina
                                                    </Button>
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                ) : (
                                    <Alert variant="info" className='rounded-5'>Nessuna uscita trovata.</Alert>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default UsciteListComponent;