# librerías a instalar

(herramientas-> administrador de paquetes de nuget -> consola del administrador de paquetes)

	install-package scalar.aspnetcore
	install-package microsoft.entityframeworkcore.sqlserver
	install-package microsoft.entityframeworkcore.tools
	install-package microsoft.entityframeworkcore.design
	install-package microsoft.openapi -version 2.7.6

# cadena de conexión:
## con autenticación de usuario
	Scaffold-DbContext "server=.\sqlexpress; Initial Catalog=juegosdb; user id=sa; password=ipvg2026;TrustServerCertificate=True;" Microsoft.EntityFrameworkCore.SqlServer -OutputDir Models
## sin autenticación de usuario
	Scaffold-DbContext "server=.\sqlexpress; Initial Catalog=juegosdb;Trusted_Connection=True;TrustServerCertificate=True;" Microsoft.EntityFrameworkCore.SqlServer -OutputDir Models