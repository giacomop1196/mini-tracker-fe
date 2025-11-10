import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

function NavbarComponent({ onLogout }) {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');

    const handleLogout = () => {

        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole'); 

        if (onLogout) {
            onLogout();
        }
        navigate('/login', { replace: true });
    };

    return (
        <Navbar className='bg-transparent' expand="lg" collapseOnSelect>
            <Container>
                <Navbar.Brand as={Link} to="/dashboard">
                    Mini Tracker
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">

                  
                    <Nav className="me-auto">
                        
                      
                        <Nav.Link as={Link} to="/dashboard">
                            Dashboard
                        </Nav.Link>

                       
                        {userRole === 'USER' && (
                            <>
                                <Nav.Link as={Link} to="/entrate">
                                    Entrate
                                </Nav.Link>
                                <Nav.Link as={Link} to="/uscite">
                                    Uscite
                                </Nav.Link>
                            </>
                        )}

                       
                        {userRole === 'ADMIN' && (
                            <Nav.Link as={Link} to="/utenti">
                                Gestione Utenti
                            </Nav.Link>
                        )}
                    </Nav>
                  
                    <Nav>
                        <NavDropdown
                            title="Profilo"
                            id="basic-nav-dropdown"
                            align="end"
                        >
                            <NavDropdown.Item as={Link} to="/profilo">
                                <i className="bi bi-person-circle"></i> Visualizza profilo
                            </NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item onClick={handleLogout}>
                                <i className="bi bi-box-arrow-in-left"></i>  Logout
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>

                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavbarComponent;