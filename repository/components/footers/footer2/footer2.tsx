import styles from './footer2.module.css'

interface FooterLink {
  label: string
  href: string
}

interface Footer2Props {
  copyright: string
  links?: FooterLink[]
}

export default function Footer2({ copyright, links = [] }: Footer2Props) {
  return (
    <footer className={`bg-light text-dark ${styles.footer}`}>
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
