import styles from './header2.module.css'

interface NavLink {
  label: string
  href: string
}

interface Header2Props {
  brand: string
  links?: NavLink[]
}

export default function Header2({ brand, links = [] }: Header2Props) {
  return (
    <nav className={`navbar navbar-expand-lg navbar-light bg-white ${styles.navbar}`}>
      <div className="container">
        <a className={`navbar-brand ${styles.brand}`} href="/">{brand}</a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#header2Nav"
          aria-controls="header2Nav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="header2Nav">
          <ul className="navbar-nav ms-auto">
            {links.map((link) => (
              <li className="nav-item" key={link.href}>
                <a className={`nav-link ${styles.navLink}`} href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  )
}
