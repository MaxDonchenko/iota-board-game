import { useNavigate } from 'react-router-dom';
import styles from './Welcome.module.css';

export function Welcome() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Welcome to IOTA</h1>
        <p className={styles.subtitle}>A game of logic, strategy, and color.</p>
      </header>

      <main className={styles.main}>
        <section className={styles.infoSection}>
          <h2>About the Game</h2>
          <p>
            IOTA is a simple yet deep tactical card game. Players place cards on a grid, forming
            lines that share or differ in three attributes: Shape, Color, and Number.
          </p>
          <div className={styles.links}>
            <a
              href="https://boardgamegeek.com/boardgame/119632/iota"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Learn more on BoardGameGeek
            </a>
            <a
              href="https://cdn.1j1ju.com/medias/0e/e4/7f-iota-rulebook.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Official Rules (PDF)
            </a>
          </div>
        </section>

        <section className={styles.modesSection}>
          <h2>Choose Your Mode</h2>
          <div className={styles.buttonGroup}>
            <div className={styles.modeCard} onClick={() => navigate('/hotseat/setup')}>
              <div className={styles.modeIcon}>👥</div>
              <h3>Hotseat</h3>
              <p>Pass-and-play with friends locally.</p>
              <button className={styles.modeButton}>Play Hotseat</button>
            </div>

            <div className={styles.modeCard} onClick={() => navigate('/hotseat/setup?vs=ai')}>
              <div className={styles.modeIcon}>🤖</div>
              <h3>vs AI</h3>
              <p>Test your skills against the computer.</p>
              <button className={styles.modeButton}>Play vs AI</button>
            </div>

            <div className={styles.modeCard} onClick={() => navigate('/multiplayer/setup')}>
              <div className={styles.modeIcon}>🌐</div>
              <h3>Multiplayer</h3>
              <p>Play with anyone, anywhere.</p>
              <button className={styles.modeButton}>Play Multiplayer</button>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>
          © {new Date().getFullYear()} IOTA Digital. Original game by{' '}
          <a
            href="https://en.wikipedia.org/wiki/Gene_Mackles"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Gene Mackles
          </a>
          . Web implementation by{' '}
          <a
            href="https://github.com/MaxDonchenko"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Max Donchenko
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
