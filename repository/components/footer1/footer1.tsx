import styles from './footer1.module.css'

interface FooterLink {
  label: string
  href: string
}

interface Footer1Props {
  copyright: string
  links?: FooterLink[]
}

export default function Footer1({ copyright, links = [] }: Footer1Props) {
  return (
    <footer className={`bg-dark text-white ${styles.footer}`}>
      <div className="container">
        <div className={`d-flex flex-wrap justify-content-between align-items-center ${styles.inner}`}>
          <span className={styles.copyright}>{copyright}</span>
          {links.length > 0 && (
            <ul className={`list-inline mb-0 ${styles.links}`}>
              {links.map((link) => (
                <li className="list-inline-item" key={link.href}>
                  <a className={styles.link} href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  )
}
