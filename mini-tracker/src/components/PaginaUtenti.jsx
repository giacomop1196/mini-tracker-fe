import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Spinner } from 'react-bootstrap';

function PaginaUtenti() {
    const [utenti, setUtenti] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const token = localStorage.getItem('authToken');

    const fetchUtenti = () => {
        setIsLoading(true);
        fetch('http://localhost:5000/user', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
            .then(res => res.json())
            .then(data => {
                setUtenti(data.content || []);
                setIsLoading(false);
            })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchUtenti();
    }, []);

    const handleToggleLock = (userId, isLocked) => {
        const endpoint = isLocked ? 'unlock' : 'lock';

        fetch(`http://localhost:5000/user/${userId}/${endpoint}`, {
            method: 'PATCH',
            headers: { 'Authorization': 'Bearer ' + token }
        })
            .then(res => {
                if (res.ok) {
                    setUtenti(utenti.map(u =>
                        u.userId === userId ? { ...u, locked: !isLocked } : u
                    ));
                }
            });
    };

    if (isLoading) return <Spinner />;

    return (
        <div className='sfondo'>
            <Container>
                <Row className="justify-content-md-center">
                    <Col md={8}>
                        <Card className='rounded-5 mt-5 p-4'>
                             <Card.Header as="h3"><i className="bi bi-person-lines-fill"></i> Lista Utenti</Card.Header>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Stato</th>
                                        <th>Azioni</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {utenti.map(user => (
                                        <tr key={user.userId}>
                                            <td>{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>{user.locked ? 'Bloccato' : 'Attivo'}</td>
                                            <td>
                                                <Button
                                                    variant={user.locked ? 'success' : 'danger'}
                                                    onClick={() => handleToggleLock(user.userId, user.locked)}
                                                >
                                                  <i className="bi bi-ban"></i>  {user.locked ? 'Sblocca' : 'Blocca'}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default PaginaUtenti;