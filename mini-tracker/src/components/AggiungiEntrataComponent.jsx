import { useState } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000';

function AggiungiEntrataComponent() {

    const [formData, setFormData] = useState({
        date: '',
        amount: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();



    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');
        if (!token) {
            setError('Sessione scaduta.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        const payload = {
            date: formData.date,
            amount: parseFloat(formData.amount)
        };

        const API_URL_CREATE = `${API_BASE_URL}/user/${userId}/revenue`;

        fetch(API_URL_CREATE, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        })
            .then(response => {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('authToken');
                    throw new Error('Sessione scaduta. Effettua il login.');
                }
                if (!response.ok) {
                    return response.json().then(errData => {
                        const msg = errData.message || 'Errore durante la creazione dell\'entrata.';
                        throw new Error(msg);
                    });
                }
                return response.json();
            })
            .then(data => {

                setSuccess(`Entrata del ${data.date} creata con successo!`);
                setFormData({ date: '', amount: '' });
                setTimeout(() => navigate('/entrate'), 2000);
            })
            .catch(err => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className='sfondo'>
            <Container>
                <Row className="justify-content-md-center">
                    <Col md={8}>
                        <Card className='rounded-5 mt-5'>
                            <Card.Header as="h3"><i className="bi bi-plus-circle"></i> Aggiungi Entrata</Card.Header>
                            <Card.Body>
                                <Form onSubmit={handleSubmit}>
                                    {error && <Alert variant="danger">{error}</Alert>}
                                    {success && <Alert variant="success">{success}</Alert>}

                                    <Form.Group className="mb-3" controlId="formDate">
                                        <Form.Label>Data Entrata</Form.Label>
                                        <Form.Control className='rounded-5' type="date" name="date" value={formData.date} onChange={handleChange} required />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formAmount">
                                        <Form.Label>Importo (€)</Form.Label>
                                        <Form.Control className='rounded-5' type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} required />
                                    </Form.Group>

                                    <hr />
                                    <Button variant="secondary" onClick={() => navigate(-1)} className="me-2 rounded-5" disabled={loading}>
                                        Annulla
                                    </Button>
                                    <Button variant="primary" className='rounded-5' type="submit" disabled={loading}>
                                        <i className="bi bi-floppy"></i>  {loading ? 'Salvataggio...' : 'Salva Entrata'}
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

export default AggiungiEntrataComponent;