import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import styles from './Info.module.css';

export function Info() {
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to anchor if hash is present
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location.hash]);

  return (
    <div className={styles.container}>
      <button onClick={() => navigate('/')} className={styles.backButton}>
        ← Back to Home
      </button>
      <div className={styles.content}>
        <h1 className={styles.title}>Iota Board Game - Information</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Game Overview</h2>
          <p>
            Iota is a card game where players place cards on a grid, creating lines that share
            common attributes (shape, number, or color). The goal is to score points by forming
            valid lines and combinations. Each turn, you can place one or more cards that form valid
            lines, or pass your turn.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            <strong>Note:</strong> Threefold repetition — if every player passes their turn three
            times in a row (in turn order), the game automatically ends in a draw. This rule wasn't
            part of the original rulebook but was added here to prevent games from getting stuck.
          </p>
          <p>
            <a
              href="https://cdn.1j1ju.com/medias/0e/e4/7f-iota-rulebook.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              View full rules →
            </a>
          </p>
        </section>

        <section className={styles.section} id="multiplayer">
          <h2 className={styles.sectionTitle}>Multiplayer</h2>
          <p>
            <strong>Important:</strong> Multiplayer is currently experimental and can be flaky. The
            connection will break if players reload the page once the room is created. We recommend
            keeping all browser tabs open during the game.
          </p>

          <h3 className={styles.subsectionTitle}>PeerJS Mode</h3>
          <p>
            PeerJS uses WebRTC for peer-to-peer connections. No server setup is required - players
            connect directly to each other through a signaling server. This mode works best for
            local networks or when players are on the same network.
          </p>

          <h3 className={styles.subsectionTitle}>Supabase Mode</h3>
          <p>Supabase provides a real-time database backend for multiplayer. To use this mode:</p>
          <ol className={styles.list}>
            <li>
              Create a free account at{' '}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                supabase.com
              </a>
            </li>
            <li>Create a new project</li>
            <li>Go to Project Settings → API</li>
            <li>
              Copy the <strong>Project URL</strong> and paste it into the "Supabase URL" field
            </li>
            <li>
              Copy the <strong>anon/public key</strong> and paste it into the "Supabase Anon Key"
              field
            </li>
          </ol>
          <p>
            The Supabase mode is more reliable for players on different networks but requires
            setting up a Supabase project.
          </p>
        </section>

        <section className={styles.section} id="ai">
          <h2 className={styles.sectionTitle}>AI Difficulty Levels</h2>
          <p>The game includes an AI opponent with three difficulty levels:</p>
          <ul className={styles.list}>
            <li>
              <strong>Easy:</strong> The AI makes basic valid moves, prioritizing simple placements.
            </li>
            <li>
              <strong>Medium:</strong> The AI considers scoring opportunities and tries to maximize
              points while blocking opponents.
            </li>
            <li>
              <strong>Hard:</strong> The AI uses advanced strategies, calculates optimal placements,
              and actively tries to prevent opponents from scoring.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Contact & Support</h2>
          <p>For inquiries, bug reports, or feature requests, please contact:</p>
          <p className={styles.contact}>
            <strong>Max Donchenko</strong>
            <br />
            <a
              href="https://github.com/maxdonchenko"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              GitHub: @maxdonchenko
            </a>
          </p>
          <p className={styles.salute}>🫡 To your service!</p>
        </section>
      </div>
    </div>
  );
}
