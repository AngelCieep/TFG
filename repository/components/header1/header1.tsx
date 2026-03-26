import styles from './header1.module.css'

interface NavLink {
  label: string
  href: string
}

interface Header1Props {
  brand: string
  links?: NavLink[]
}

export default function Header1({ brand, links = [] }: Header1Props) {
  return (
    <nav className={`navbar navbar-expand-lg navbar-dark bg-dark ${styles.navbar}`}>
      <div className="container">
        <a className="navbar-brand" href="/">{brand}</a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#header1Nav"
          aria-controls="header1Nav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="header1Nav">
          <ul className="navbar-nav ms-auto">
            {links.map((link) => (
              <li className="nav-item" key={link.href}>
                <a className="nav-link" href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  )
}
