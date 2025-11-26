import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import FooterComponent from './FooterComponent';
import NavbarWhiteComponent from './NavbarWhiteComponent';
function HomeComponent() {
    return (
        <div className="d-flex flex-column min-vh-100">
            {/* Navbar */}
            <NavbarWhiteComponent />

            <header className="bg-light py-5 border-bottom" style={{ marginTop: '70px' }}>
                <Container className="text-center py-5">
                    <Row className="justify-content-center">
                        <Col lg={8}>
                            <h1 className="display-4 fw-bold mb-3 text-dark">
                                Gestisci le tue finanze <br />
                                <span className="text-primary">con semplicità</span>
                            </h1>
                            <p className="lead text-muted mb-4">
                                Mini Tracker è lo strumento ideale per tenere traccia delle tue entrate e uscite.
                                Analizza i tuoi risparmi e prendi il controllo del tuo portafoglio.
                            </p>
                            <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                                <Button as={Link} to="/register" variant="primary" size="lg" className="px-5 rounded-pill d-flex align-items-center justify-content-center gap-2">
                                    Inizia Gratis <i className="bi bi-arrow-right"></i>
                                </Button>
                                <Button as={Link} to="/login" variant="outline-secondary" size="lg" className="px-5 rounded-pill">
                                    Accedi
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </header>

            <section className="py-5 sfondoHomeCard">
                <Container>
                    <Row className="text-center g-4">
                        {/* Card 1 */}
                        <Col md={4}>
                            <Card className="h-100 border-0 shadow-sm hover-up transition-card">
                                <Card.Body className="p-4">
                                    <div className="feature-icon bg-primary bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '64px', height: '64px' }}>
                                        <i className="bi bi-wallet2 fs-2"></i>
                                    </div>
                                    <h3 className="h4 fw-bold mt-2">Tracciamento Spese</h3>
                                    <p className="text-muted">
                                        Registra ogni movimento in pochi click. Categorizza le tue spese per capire dove finiscono i tuoi soldi.
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Card 2 */}
                        <Col md={4}>
                            <Card className="h-100 border-0 shadow-sm hover-up transition-card">
                                <Card.Body className="p-4">
                                    <div className="feature-icon bg-success bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '64px', height: '64px' }}>
                                        <i className="bi bi-graph-up-arrow fs-2"></i>
                                    </div>
                                    <h3 className="h4 fw-bold mt-2">Analisi Grafica</h3>
                                    <p className="text-muted">
                                        Visualizza l'andamento delle tue finanze con grafici intuitivi e report mensili dettagliati.
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Card 3 */}
                        <Col md={4}>
                            <Card className="h-100 border-0 shadow-sm hover-up transition-card">
                                <Card.Body className="p-4">
                                    <div className="feature-icon bg-info bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '64px', height: '64px' }}>
                                        <i className="bi bi-shield-lock fs-2"></i>
                                    </div>
                                    <h3 className="h4 fw-bold mt-2">Sicuro & Cloud</h3>
                                    <p className="text-muted">
                                        I tuoi dati sono al sicuro e accessibili da qualsiasi dispositivo, ovunque ti trovi.
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Footer */}
            <FooterComponent />

            {/* CSS inline per l'effetto hover sulle card */}
            <style>{`
                .hover-up:hover {
                    transform: translateY(-5px);
                    transition: transform 0.3s ease;
                }
                .transition-card {
                    transition: transform 0.3s ease;
                }
            `}</style>
        </div>
    );
}

export default HomeComponent;