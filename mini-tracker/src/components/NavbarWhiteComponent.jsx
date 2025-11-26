import { Container, Button, Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function NavbarWhiteComponent() {
    return (
        <Navbar bg="white" expand="lg" className="shadow-sm py-3 fixed-top">
            <Container>
                <Navbar.Brand as={Link} to="/" className="fw-bold text-primary d-flex align-items-center">
                   <img
                        src="img/logo.png" 
                        alt="Mini Tracker Logo"
                        height="40"
                        className="d-inline-block align-top me-2"
                    />
                    Mini Tracker
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                    <Nav>
                        <Nav.Link as={Link} to="/login" className="me-2 text-dark fw-medium">Accedi</Nav.Link>
                        <Button as={Link} to="/register" variant="primary" className="rounded-pill px-4">
                            Registrati
                        </Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}
export default NavbarWhiteComponent