import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, ListGroup, Image, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000';

function ProfiloUtenteComponent() {
    const [utente, setUtente] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchProfilo = useCallback(() => {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
            setError('Accesso non autorizzato. Per favore, fai il login.');
            setLoading(false);
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        // Endpoint corretto da UserController.java
        const API_URL = `${API_BASE_URL}/user/${userId}`; 
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
                    localStorage.removeItem('userId');
                    throw new Error('Sessione scaduta. Effettua nuovamente il login.');
                }
                if (!response.ok) {
                    throw new Error('Impossibile caricare i dati del profilo.');
                }
                return response.json();
            })
            .then(data => {
                setUtente(data);
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
        fetchProfilo();
    }, [fetchProfilo]);

    if (loading) {
        return (
            <div className='sfondo'>
                <Container className="text-center mt-5">
                    <Spinner animation="border" />
                    <p>Caricamento profilo...</p>
                </Container>
            </div>
        );
    }

    if (error) {
        return (
            <div className='sfondo'>
                <Container className="mt-5">
                    <Alert variant="danger">{error}</Alert>
                </Container>
            </div>
        );
    }

    return (
        <div className='sfondo'>
            <Container>
                <Row className="justify-content-md-center">
                    <Col md={8}>
                        <Card className='mt-5 rounded-5'>
                            <Card.Header as="h3" className="d-flex justify-content-between align-items-center">
                                <span><i className="bi bi-person-circle me-2"></i> Il Mio Profilo</span>
                                <Button variant="outline-primary" size="sm" className='rounded-5' onClick={() => navigate('/profilo/modifica')}>
                                    <i className="bi bi-pencil-square me-1"></i> Modifica
                                </Button>
                            </Card.Header>
                            <Card.Body>
                                {utente ? (
                                    <>
                                        <div className="text-center mb-3">
                                            {/* Immagine Avatar */}
                                            <Image 
                                                src={utente.avatarURL || 'https://i0.wp.com/www.lombardoandrea.com/wp-content/uploads/immagine_profilo_facebook_lombardoandrea_com.png?fit=720%2C340&ssl=1'} 
                                                roundedCircle 
                                                style={{ width: '150px', height: '150px', objectFit: 'cover' }} 
                                            />
                                        </div>
                                        <ListGroup variant="flush">
                                            <ListGroup.Item>
                                                <strong>Nome:</strong> {utente.name}
                                            </ListGroup.Item>
                                            <ListGroup.Item>
                                                <strong>Cognome:</strong> {utente.surname}
                                            </ListGroup.Item>
                                            <ListGroup.Item>
                                                <strong>Email:</strong> {utente.email}
                                            </ListGroup.Item>
                                            <ListGroup.Item>
                                                <strong>Username:</strong> {utente.username}
                                            </ListGroup.Item>
                                            <ListGroup.Item>
                                                <strong>Ruolo:</strong> {utente.role}
                                            </ListGroup.Item>
                                        </ListGroup>
                                    </>
                                ) : (
                                    <Alert variant="warning">Dati utente non trovati.</Alert>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default ProfiloUtenteComponent;