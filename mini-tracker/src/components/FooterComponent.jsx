import { Container } from 'react-bootstrap';

function FooterComponent() {
    return (
         <footer className="py-4 mt-auto bg-dark text-white">
                <Container className="text-center">
                    <div className="mb-3">
                        <a href="https://github.com/giacomop1196" className="text-white mx-2"><i className="bi bi-github fs-5"></i></a>
                        <a href="#" className="text-white mx-2"><i className="bi bi-linkedin fs-5"></i></a>
                    </div>
                    <p className="mb-0 small opacity-75">&copy; {new Date().getFullYear()} Mini Tracker. Sviluppato da Giacomo Pillitteri.</p>
                </Container>
            </footer>
    )
}

export default FooterComponent