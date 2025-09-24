export default function App() {
  return (
    <div>
      <header>
        <h1>UM Exchange</h1>
        <nav>
          <a href="#universidades">Universidades</a>
          <a href="#comparar">Comparar</a>
          <a href="#reviews">Reviews</a>
          <a href="#about">Acerca</a>
        </nav>
      </header>

      <main>
        <section id="universidades">
          <h2>Universidades</h2>
          <p>Lista de universidades acá…</p>
        </section>

        <section id="comparar">
          <h2>Comparar</h2>
          <p>Acá irá el comparador…</p>
        </section>

        <section id="reviews">
          <h2>Reviews</h2>
          <p>Testimonios de alumnos…</p>
        </section>

        <section id="about">
          <h2>Acerca</h2>
          <p>Proyecto de la UM para elegir intercambio.</p>
        </section>
      </main>

      <footer>
        <p>© UM Exchange</p>
      </footer>
    </div>
  );
}