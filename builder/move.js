/*
 *
 *  move.js - Copia la plantilla y los componentes al directorio de salida.
 *
 *  Recibe el objeto verificado por verify.js y realiza las siguientes operaciones:
 *
 *    1. Copia el contenido de repository/templates/<template>/ a una carpeta nueva
 *       en el directorio de salida con el nombre del proyecto (projectName).
 *
 *    2. Para cada componente de la lista, copia todos los archivos de su carpeta
 *       en repository/components/<nombreComponente>/ al directorio src/components/
 *       del proyecto generado.
 *
 *    3. Crea las carpetas intermedias que sean necesarias si no existen.
 *
 *  El resultado de este paso es un proyecto React con la plantilla base y los
 *  componentes en su lugar, listo para que import.js genere los imports en App.tsx.
 *
 */