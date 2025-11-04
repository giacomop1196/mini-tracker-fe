import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000';

function ModificaProfiloComponent() {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        username: ''
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('authToken');

    // 1. Carica i dati attuali dell'utente
    useEffect(() => {
        if (!token || !userId) {
            setError('Accesso non autorizzato.');
            setLoadingData(false);
            return;
        }

        const API_URL = `${API_BASE_URL}/user/${userId}`;
        fetch(API_URL, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            if (!response.ok) throw new Error('Impossibile caricare i dati utente.');
            return response.json();
        })
        .then(data => {
           
            setFormData({
                name: data.name,
                surname: data.surname,
                email: data.email,
                username: data.username
            });
        })
        .catch(err => setError(err.message))
        .finally(() => setLoadingData(false));

    }, [token, userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!token || !userId) {
            setError('Sessione scaduta.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        const payload = {
            name: formData.name,
            surname: formData.surname,
            email: formData.email,
            username: formData.username
        };

        const API_URL_UPDATE = `${API_BASE_URL}/user/${userId}`;

        fetch(API_URL_UPDATE, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        })
            .then(response => {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Sessione scaduta. Effettua il login.');
                }
                if (!response.ok) {
                    return response.json().then(errData => {
                        const msg = errData.message || 'Errore durante l\'aggiornamento.';
                        throw new Error(msg);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log(data)
                setSuccess('Profilo aggiornato con successo!');
                setTimeout(() => navigate('/profilo'), 2000);
            })
            .catch(err => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    if (loadingData) {
        return (
            <div className='sfondo'>
                <Container className="text-center mt-5"><Spinner animation="border" /></Container>
            </div>
        );
    }

    return (
        <div className='sfondo'>
            <Container>
                <Row className="justify-content-md-center">
                    <Col md={8}>
                        <Card className='rounded-5 mt-5'>
                            <Card.Header as="h3"><i className="bi bi-pencil-square"></i> Modifica Profilo</Card.Header>
                            <Card.Body>
                                <Form onSubmit={handleSubmit}>
                                    {error && <Alert variant="danger">{error}</Alert>}
                                    {success && <Alert variant="success">{success}</Alert>}

                                    <Form.Group className="mb-3" controlId="formName">
                                        <Form.Label>Nome</Form.Label>
                                        <Form.Control className='rounded-5' type="text" name="name" value={formData.name} onChange={handleChange} required />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formSurname">
                                        <Form.Label>Cognome</Form.Label>
                                        <Form.Control className='rounded-5' type="text" name="surname" value={formData.surname} onChange={handleChange} required />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formEmail">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control className='rounded-5' type="email" name="email" value={formData.email} onChange={handleChange} required />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formUsername">
                                        <Form.Label>Username</Form.Label>
                                        <Form.Control className='rounded-5' type="text" name="username" value={formData.username} onChange={handleChange} required />
                                    </Form.Group>

                                    <hr />
                                    <Button variant="secondary" onClick={() => navigate('/profilo')} className="me-2 rounded-5" disabled={loading}>
                                        Annulla
                                    </Button>
                                    <Button variant="primary" className='rounded-5' type="submit" disabled={loading}>
                                        <i className="bi bi-floppy"></i>  {loading ? 'Salvataggio...' : 'Salva Modifiche'}
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default ModificaProfiloComponent;