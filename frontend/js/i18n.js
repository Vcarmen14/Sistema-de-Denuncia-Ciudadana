// Sistema de internacionalización mejorado
class I18nManager {
  constructor() {
    this.currentLanguage = 'es'
    this.translations = {}
    this.init()
  }

  init() {
    this.loadTranslations()
    this.setupLanguageSelector()
    this.detectLanguage()
  }

  loadTranslations() {
    this.translations = {
      es: {
        // Navegación
        'nav.home': 'Inicio 🏠',
        'nav.report': 'Reportar Incidencia ⚠️',
        'nav.map': 'Mapa de Incidencias 🗺️',
        'nav.reports': 'Mis Denuncias 📋',
        'nav.profile': 'Mi Perfil 👤',
        'nav.help': 'Ayuda y FAQ ❓',
        'nav.notifications': 'Notificaciones 🔔',
        'nav.feedback': 'Feedback 💬',

        // Páginas
        'page.title': 'Sistema de Denuncia Ciudadana - Municipio de Manta',
        'page.home': 'Inicio',
        'page.report': 'Reportar Incidencia',
        'page.map': 'Mapa de Incidencias',
        'page.reports': 'Mis Denuncias',
        'page.profile': 'Mi Perfil',
        'page.help': 'Ayuda y FAQ',
        'page.notifications': 'Notificaciones',
        'page.feedback': 'Feedback',

        // Header
        'header.title': 'Sistema de Denuncia Ciudadana - Municipio de Manta',

        // Autenticación
        'auth.login': 'Iniciar Sesión',
        'auth.register': 'Registrarse',
        'auth.logout': 'Cerrar Sesión',
        'auth.login_title': 'Iniciar Sesión',
        'auth.register_title': 'Crear Cuenta',
        'auth.name': 'Nombre',
        'auth.email': 'Correo electrónico',
        'auth.phone': 'Teléfono',
        'auth.password': 'Contraseña',
        'auth.confirm_password': 'Confirmar contraseña',
        'auth.name_placeholder': 'Tu nombre completo',
        'auth.email_placeholder': 'tu@email.com',
        'auth.phone_placeholder': '+593 99 123 4567',
        'auth.password_placeholder': 'Tu contraseña',
        'auth.password_min_chars': 'Mínimo 8 caracteres',
        'auth.confirm_password_placeholder': 'Confirma tu contraseña',
        'auth.login_required': 'Debes iniciar sesión para acceder a esta función',
        'auth.access_required': 'Acceso Requerido',
        'auth.no_account': '¿No tienes cuenta?',
        'auth.have_account': '¿Ya tienes cuenta?',
        'auth.register_here': 'Regístrate aquí',
        'auth.login_here': 'Inicia sesión aquí',
        'auth.logging_in': 'Iniciando sesión...',
        'auth.registering': 'Registrando...',
        'auth.welcome_back': '¡Bienvenido de vuelta!',
        'auth.register_success': 'Cuenta creada exitosamente',

        // Accesibilidad
        'accessibility.title': 'Accesibilidad',
        'accessibility.options': 'Opciones de Accesibilidad',
        'accessibility.mono_mode': 'Modo monocromático',
        'accessibility.high_contrast': 'Modo alto contraste',
        'accessibility.color_theme': 'Tema de color',
        'accessibility.font_size': 'Tamaño de Fuente',
        'accessibility.line_height': 'Interlineado',
        'accessibility.dyslexia_font': 'Tipografía Dislexia-Friendly',
        'accessibility.zoom': 'Zoom de la página',
        'accessibility.speech': 'Lectura por Voz',
        'accessibility.visual_alerts': 'Alertas visuales',
        'accessibility.pause_animations': 'Pausar animaciones',
        'accessibility.audio_description': 'Descripción de audio',
        'accessibility.keyboard_help': 'Ayuda de Teclado',

        // Temas
        'theme.default': 'Por defecto',
        'theme.blue': 'Azul',
        'theme.green': 'Verde',
        'theme.orange': 'Naranja',

        // Tamaños
        'size.small': 'Pequeño',
        'size.normal': 'Normal',
        'size.large': 'Grande',

        // Espaciado
        'spacing.normal': 'Normal',
        'spacing.medium': 'Medio',
        'spacing.wide': 'Amplio',

        // Reportes
        'report.title': 'Título del reporte',
        'report.type': 'Tipo',
        'report.location': 'Ubicación',
        'report.description': 'Descripción',
        'report.photos': 'Fotos',
        'report.title_placeholder': 'Ej: Bache en la vía principal',
        'report.location_placeholder': 'Ej: Av. Malecón y Calle 15',
        'report.description_placeholder': 'Describe detalladamente la incidencia...',
        'report.drag_photos': 'Arrastra fotos aquí o haz clic para seleccionar',
        'report.select_photos': 'Seleccionar Fotos',
        'report.submit': 'Enviar Reporte',
        'report.login_required': 'Debes iniciar sesión para reportar incidencias.',
        'report.success': 'Reporte enviado exitosamente',
        'report.error': 'Error al enviar el reporte',
        'report.submitting': 'Enviando reporte...',

        // Tipos de reporte
        'report.type.infrastructure': 'Infraestructura',
        'report.type.lighting': 'Alumbrado',
        'report.type.cleaning': 'Limpieza',
        'report.type.security': 'Seguridad',
        'report.type.transport': 'Transporte',
        'report.type.other': 'Otro',

        // Estados
        'status.pending': 'Pendiente',
        'status.in_progress': 'En proceso',
        'status.resolved': 'Resuelta',

        // Prioridades
        'priority.high': 'Alta',
        'priority.medium': 'Media',
        'priority.low': 'Baja',

        // Estadísticas
        'stats.total_reported': 'Total Reportadas',
        'stats.in_progress': 'En Proceso',
        'stats.resolved': 'Resueltas',
        'stats.pending': 'Pendientes',

        // Mapa
        'map.filter_type': 'Filtrar por tipo',
        'map.filter_status': 'Filtrar por estado',
        'map.filter_priority': 'Filtrar por prioridad',
        'map.search_zone': 'Buscar zona',
        'map.all_types': 'Todos los tipos',
        'map.all_status': 'Todos los estados',
        'map.all_priorities': 'Todas las prioridades',
        'map.results_found': 'resultados encontrados',
        'map.no_results': 'No se encontraron resultados',
        'map.interactive_title': 'Vista Geográfica',
        'map.geographic_view': 'Visualización de incidencias por zona geográfica',
        'map.integration_note': 'Mapa interactivo con ubicaciones reales',
        'map.incidents_by_zone': 'Incidencias por Zona',

        // Formularios
        'form.save_changes': 'Guardar Cambios',
        'form.no_changes_detected': 'No se detectaron cambios',
        'form.changes_saved': 'Cambios guardados correctamente',
        'form.unsaved_changes': 'Tienes cambios sin guardar',
        'form.unsaved_changes_title': 'Cambios sin guardar',
        'form.reset_form_title': 'Limpiar formulario',
        'form.reset_form_message': '¿Estás seguro de que deseas limpiar el formulario?',
        'form.passwords_dont_match': 'Las contraseñas no coinciden',

        // Perfil
        'profile.personal_info': 'Información Personal',
        'profile.edit': 'Editar',
        'profile.edit_info': 'Editar Información',
        'profile.not_provided': 'No proporcionado',
        'profile.registration_date': 'Fecha de registro',
        'profile.account_type': 'Tipo de cuenta',
        'profile.activity_summary': 'Resumen de Actividad',
        'profile.total_reports': 'Reportes Totales',
        'profile.resolved_reports': 'Reportes Resueltos',
        'profile.active_reports': 'Reportes Activos',
        'profile.account_access': 'Acceso a la Cuenta',
        'profile.access_description': 'Inicia sesión o crea una cuenta para acceder a todas las funciones del sistema.',
        'profile.account_benefits': 'Beneficios de tener cuenta:',
        'profile.benefit_1': 'Reportar incidencias',
        'profile.benefit_2': 'Seguimiento de reportes',
        'profile.benefit_3': 'Notificaciones de estado',
        'profile.benefit_4': 'Historial personalizado',
        'profile.role.user': 'Usuario',
        'profile.role.admin': 'Administrador',

        // Contraseñas
        'password.weak': 'Débil',
        'password.medium': 'Media',
        'password.strong': 'Fuerte',
        'password.security': 'Seguridad',

        // Reportes
        'reports.no_reports': 'No tienes reportes aún',
        'reports.no_reports_desc': 'Cuando reportes una incidencia, aparecerá aquí para que puedas hacer seguimiento.',
        'reports.create_first': 'Crear mi primer reporte',

        // Incidencias
        'incident.date': 'Fecha',
        'incident.priority': 'Prioridad',

        // Notificaciones
        'notification.mark_read': 'Marcar como leída',
        'notification.marked_read': 'Notificación marcada como leída',
        'notification.mark_error': 'Error al marcar notificación',

        // Ayuda
        'help.contact_title': 'Contáctanos',
        'help.contact_description': '¿Tienes alguna pregunta o necesitas ayuda? Envíanos un mensaje.',
        'help.contact_name': 'Nombre',
        'help.contact_email': 'Correo electrónico',
        'help.contact_phone': 'Teléfono (opcional)',
        'help.contact_subject': 'Asunto',
        'help.contact_message': 'Mensaje',
        'help.contact_message_placeholder': 'Describe tu consulta o problema...',
        'help.contact_send': 'Enviar Mensaje',
        'help.contact_clear': 'Limpiar',
        'help.select_subject': 'Selecciona un asunto',
        'help.subject.technical': 'Problema técnico',
        'help.subject.general': 'Consulta general',
        'help.subject.suggestion': 'Sugerencia',
        'help.subject.complaint': 'Reclamo',
        'help.subject.other': 'Otro',
        'help.message_sent': 'Mensaje enviado correctamente',
        'help.message_error': 'Error al enviar el mensaje',

        // FAQ
        'faq.report_how.question': '¿Cómo puedo reportar una incidencia?',
        'faq.report_how.answer': 'Para reportar una incidencia, debes crear una cuenta e iniciar sesión. Luego ve a la sección "Reportar Incidencia", completa el formulario con los detalles y envía tu reporte.',
        'faq.resolution_time.question': '¿Cuánto tiempo toma resolver una incidencia?',
        'faq.resolution_time.answer': 'El tiempo de resolución depende del tipo y complejidad de la incidencia. Las incidencias de alta prioridad se atienden en 24-48 horas, mientras que otras pueden tomar de 3 a 15 días hábiles.',
        'faq.tracking.question': '¿Puedo hacer seguimiento a mi reporte?',
        'faq.tracking.answer': 'Sí, una vez que inicies sesión puedes ver todos tus reportes en la sección "Mis Denuncias" y recibir notificaciones sobre cambios de estado.',
        'faq.incident_types.question': '¿Qué tipos de incidencias puedo reportar?',
        'faq.incident_types.answer': 'Puedes reportar problemas de infraestructura, alumbrado público, limpieza, seguridad, transporte público y otros problemas que afecten a la comunidad.',
        'faq.account_required.question': '¿Necesito una cuenta para usar el sistema?',
        'faq.account_required.answer': 'Puedes ver las incidencias públicas sin cuenta, pero necesitas registrarte para reportar nuevas incidencias y hacer seguimiento a tus reportes.',
        'faq.data_security.question': '¿Mis datos están seguros?',
        'faq.data_security.answer': 'Sí, todos los datos se manejan de forma segura y confidencial. Solo se comparte la información necesaria para resolver las incidencias reportadas.',

        // Feedback
        'feedback.description': 'Tu opinión es importante para nosotros. Comparte tus comentarios sobre el sistema.',
        'feedback.type': 'Tipo de feedback',
        'feedback.message': 'Mensaje',
        'feedback.message_placeholder': 'Comparte tu experiencia, sugerencias o reporta problemas...',
        'feedback.send': 'Enviar Feedback',
        'feedback.success': 'Feedback enviado correctamente',
        'feedback.error': 'Error al enviar feedback',
        'feedback.type.suggestion': 'Sugerencia',
        'feedback.type.problem': 'Problema',
        'feedback.type.compliment': 'Felicitación',
        'feedback.type.other': 'Otro',

        // Búsqueda
        'search.placeholder': 'Buscar por ubicación...',

        // Teclado
        'keyboard.title': 'Atajos de Teclado Disponibles',
        'keyboard.navigation': 'Navegación',
        'keyboard.accessibility': 'Accesibilidad',
        'keyboard.home': 'Ir a Inicio',
        'keyboard.report': 'Reportar Incidencia',
        'keyboard.map': 'Ver Mapa',
        'keyboard.reports': 'Mis Denuncias',
        'keyboard.contrast': 'Cambiar contraste',
        'keyboard.speech': 'Activar/Desactivar Voz',
        'keyboard.font_small': 'Fuente Pequeña',
        'keyboard.font_normal': 'Fuente Normal',

        // Voz
        'speech.disabled': 'Desactivada',
        'speech.enabled': 'Activada',

        // Común
        'common.cancel': 'Cancelar',
        'common.save': 'Guardar',
        'common.edit': 'Editar',
        'common.delete': 'Eliminar',
        'common.confirm': 'Confirmar',
        'common.close': 'Cerrar',
        'common.loading': 'Cargando...',
        'common.error': 'Error',
        'common.success': 'Éxito',
        'common.warning': 'Advertencia',
        'common.info': 'Información',
        'common.yes': 'Sí',
        'common.no': 'No',
        'common.ok': 'OK',
        'common.activated': 'Activado',
        'common.deactivated': 'Desactivado',
        'common.page_in_development': 'Página en desarrollo',
        'common.error_loading_data': 'Error al cargar los datos',

        // Inicio
        'home.welcome_title': 'Bienvenido al Sistema de Denuncia Ciudadana',
        'home.welcome_message': 'Reporta incidencias en tu ciudad y ayuda a mejorar la calidad de vida de todos los ciudadanos.',
        'home.welcome_back': 'Bienvenido de vuelta',
        'home.recent_incidents': 'Incidencias Recientes',
        'home.recent_incidents_desc': 'Últimas incidencias reportadas por los ciudadanos',

        // Video
        'video.intro_transcript': 'Bienvenido al Sistema de Denuncia Ciudadana del Municipio de Manta. Este sistema te permite reportar incidencias en tu ciudad de manera fácil y rápida.',
        'video.download_transcript': 'Descargar transcripción',
        'video.show_captions': 'Mostrar subtítulos',
        'video.hide_captions': 'Ocultar subtítulos'
      },

      en: {
        // Navigation
        'nav.home': 'Home 🏠',
        'nav.report': 'Report Incident ⚠️',
        'nav.map': 'Incident Map 🗺️',
        'nav.reports': 'My Reports 📋',
        'nav.profile': 'My Profile 👤',
        'nav.help': 'Help & FAQ ❓',
        'nav.notifications': 'Notifications 🔔',
        'nav.feedback': 'Feedback 💬',

        // Pages
        'page.title': 'Citizen Report System - Municipality of Manta',
        'page.home': 'Home',
        'page.report': 'Report Incident',
        'page.map': 'Incident Map',
        'page.reports': 'My Reports',
        'page.profile': 'My Profile',
        'page.help': 'Help & FAQ',
        'page.notifications': 'Notifications',
        'page.feedback': 'Feedback',

        // Header
        'header.title': 'Citizen Report System - Municipality of Manta',

        // Authentication
        'auth.login': 'Sign In',
        'auth.register': 'Sign Up',
        'auth.logout': 'Sign Out',
        'auth.login_title': 'Sign In',
        'auth.register_title': 'Create Account',
        'auth.name': 'Name',
        'auth.email': 'Email',
        'auth.phone': 'Phone',
        'auth.password': 'Password',
        'auth.confirm_password': 'Confirm Password',
        'auth.name_placeholder': 'Your full name',
        'auth.email_placeholder': 'your@email.com',
        'auth.phone_placeholder': '+593 99 123 4567',
        'auth.password_placeholder': 'Your password',
        'auth.password_min_chars': 'Minimum 8 characters',
        'auth.confirm_password_placeholder': 'Confirm your password',
        'auth.login_required': 'You must sign in to access this feature',
        'auth.access_required': 'Access Required',
        'auth.no_account': "Don't have an account?",
        'auth.have_account': 'Already have an account?',
        'auth.register_here': 'Sign up here',
        'auth.login_here': 'Sign in here',
        'auth.logging_in': 'Signing in...',
        'auth.registering': 'Signing up...',
        'auth.welcome_back': 'Welcome back!',
        'auth.register_success': 'Account created successfully',

        // Accessibility
        'accessibility.title': 'Accessibility',
        'accessibility.options': 'Accessibility Options',
        'accessibility.mono_mode': 'Monochrome mode',
        'accessibility.high_contrast': 'High contrast mode',
        'accessibility.color_theme': 'Color theme',
        'accessibility.font_size': 'Font Size',
        'accessibility.line_height': 'Line Height',
        'accessibility.dyslexia_font': 'Dyslexia-Friendly Font',
        'accessibility.zoom': 'Page Zoom',
        'accessibility.speech': 'Text-to-Speech',
        'accessibility.visual_alerts': 'Visual alerts',
        'accessibility.pause_animations': 'Pause animations',
        'accessibility.audio_description': 'Audio description',
        'accessibility.keyboard_help': 'Keyboard Help',

        // Themes
        'theme.default': 'Default',
        'theme.blue': 'Blue',
        'theme.green': 'Green',
        'theme.orange': 'Orange',

        // Sizes
        'size.small': 'Small',
        'size.normal': 'Normal',
        'size.large': 'Large',

        // Spacing
        'spacing.normal': 'Normal',
        'spacing.medium': 'Medium',
        'spacing.wide': 'Wide',
        // Reports
        'report.title': 'Report Title',
        'report.type': 'Type',
        'report.location': 'Location',
        'report.description': 'Description',
        'report.photos': 'Photos',
        'report.title_placeholder': 'Ex.: Potholes on the main road',
        'report.location_placeholder': 'Ex.: Malecón Avenue and 15th Street',
        'report.description_placeholder': 'Describe the incident in detail...',
        'report.drag_photos': 'Drag photos here or click to select them',
        'report.select_photos': 'Select photos',
        'report.submit': 'Submit report',
        'report.login_required': 'You must log in to report issues.',
        'report.success': 'Report sent successfully',
        'report.error': 'Error sending report',
        'report.submitting': 'Sending report...',

        // Report Types
        'report.type.infrastructure': 'Infrastructure',
        'report.type.lighting': 'Lighting',
        'report.type.cleaning': 'Cleaning',
        'report.type.security': 'Security',
        'report.type.transport': 'Transportation',
        'report.type.other': 'Other',

        // Statuses
        'status.pending': 'Pending',
        'status.in_progress': 'In progress',
        'status.resolved': 'Resolved',

        // Priorities
        'priority.high': 'High',
        'priority.medium': 'Medium',
        'priority.low': 'Low',
        // Statistics
        'stats.total_reported': 'Total Reported',
        'stats.in_progress': 'In Progress',
        'stats.resolved': 'Resolved',
        'stats.pending': 'Pending',

        // Map
        'map.filter_type': 'Filter by type',
        'map.filter_status': 'Filter by status',
        'map.filter_priority': 'Filter by priority',
        'map.search_zone': 'Search zone',
        'map.all_types': 'All types',
        'map.all_status': 'All statuses',
        'map.all_priorities': 'All priorities',
        'map.results_found': 'Results found',
        'map.no_results': 'No results found',
        'map.interactive_title': 'Geographic View',
        'map.geographic_view': 'Display of incidents by geographic area',
        'map.integration_note': 'Interactive map with real locations',
        'map.incidents_by_zone': 'Incidents by Zone',

        // Forms
        'form.save_changes': 'Save Changes',
        'form.no_changes_detected': 'No changes detected',
        'form.changes_saved': 'Changes saved successfully',
        'form.unsaved_changes': 'You have unsaved changes',
        'form.unsaved_changes_title': 'Unsaved changes',
        'form.reset_form_title': 'Clear form',
        'form.reset_form_message': 'Are you sure you want to clear the form?',
        'form.passwords_dont_match': 'Passwords do not match',

        // Profile
        'profile.personal_info': 'Personal Information',
        'profile.edit': 'Edit',
        'profile.edit_info': 'Edit Information',
        'profile.not_provided': 'Not provided',
        'profile.registration_date': 'Registration Date',
        'profile.account_type': 'Account Type',
        'profile.activity_summary': 'Activity Summary',
        'profile.total_reports': 'Total Reports',
        'profile.resolved_reports': 'Resolved Reports',
        'profile.active_reports': 'Active Reports',
        'profile.account_access': 'Account Access',
        'profile.access_description': 'Please log in or create an account to access all system features.',
        'profile.account_benefits': 'Account Benefits:',
        'profile.benefit_1': 'Report Issues',
        'profile.benefit_2': 'Report Tracking',
        'profile.benefit_3': 'Status Notifications',
        'profile.benefit_4': 'Custom History',
        'profile.role.user': 'User',
        'profile.role.admin': 'Administrator',

        // Passwords
        'password.weak': 'Weak',
        'password.medium': 'Medium',
        'password.strong': 'Strong',
        'password.security': 'Security',

        // Reports
        'reports.no_reports': 'You do not have any reports yet',
        'reports.no_reports_desc': 'When you report an issue, it will appear here so you can follow up.',
        'reports.create_first': 'Create my first report',

        // Incidents
        'incident.date': 'Date',
        'incident.priority': 'Priority',

        // Notifications
        'notification.mark_read': 'Mark as read',
        'notification.marked_read': 'Notification marked as read',
        'notification.mark_error': 'Error marking notification',

        // Help
        'help.contact_title': 'Contact us',
        'help.contact_description': 'Do you have any questions or need help? Send us a message.',
        'help.contact_name': 'Name',
        'help.contact_email': 'Email',
        'help.contact_phone': 'Phone number (optional)',
        'help.contact_subject': 'Subject',
        'help.contact_message': 'Message',
        'help.contact_message_placeholder': 'Describe your question or problem...',
        'help.contact_send': 'Send Message',
        'help.contact_clear': 'Clear',
        'help.select_subject': 'Select a subject',
        'help.subject.technical': 'Technical problem',
        'help.subject.general': 'General question',
        'help.subject.suggestion': 'Suggestion',
        'help.subject.complaint': 'Complaint',
        'help.subject.other': 'Other',
        'help.message_sent': 'Message sent successfully',
        'help.message_error': 'Error sending message',

        // FAQ
        'faq.report_how.question': 'How can I report an issue?',
        'faq.report_how.answer': 'To report an issue, you must create an account and log in. Then go to the "Report Issue" section, fill out the form with the details, and submit your report.',
        'faq.resolution_time.question': 'How long does it take to resolve an issue?',
        'faq.resolution_time.answer': 'The resolution time depends on the type and complexity of the issue. High-priority incidents are addressed within 24-48 hours, while others may take 3-15 business days.',
        'faq.tracking.question': 'Can I track my report?',
        'faq.tracking.answer': 'Yes, once you log in you can view all your reports in the "My Reports" section and receive notifications about status changes.',
        'faq.incident_types.question': 'What types of incidents can I report?',
        'faq.incident_types.answer': 'You can report issues related to infrastructure, street lighting, cleaning, security, public transportation, and other issues affecting the community.',
        'faq.account_required.question': 'Do I need an account to use the system?',
        'faq.account_required.answer': 'You can view public incidents without an account. But you need to register to report new incidents and track your reports.',
        'faq.data_security.question': 'Is my data secure?',
        'faq.data_security.answer': 'Yes, all data is handled securely and confidentially. Only the information necessary to resolve reported incidents is shared.',

        // Feedback
        'feedback.description': 'Your opinion is important to us. Share your feedback about the system.',
        'feedback.type': 'Feedback type',
        'feedback.message': 'Message',
        'feedback.message_placeholder': 'Share your experience, suggestions, or report problems...',
        'feedback.send': 'Send feedback',
        'feedback.success': 'Feedback sent successfully',
        'feedback.error': 'Error sending feedback',
        'feedback.type.suggestion': 'Suggestion',
        'feedback.type.problem': 'Problem',
        'feedback.type.compliment': 'Congratulations',
        'feedback.type.other': 'Other',

        // Search
        'search.placeholder': 'Search by location...',
        // Keyboard
        'keyboard.title': 'Available Keyboard Shortcuts',
        'keyboard.navigation': 'Navigation',
        'keyboard.accessibility': 'Accessibility',
        'keyboard.home': 'Go to Home',
        'keyboard.report': 'Report an Incident',
        'keyboard.map': 'View Map',
        'keyboard.reports': 'My Reports',
        'keyboard.contrast': 'Change Contrast',
        'keyboard.speech': 'Turn Speech On/Off',
        'keyboard.font_small': 'Small Font',
        'keyboard.font_normal': 'Normal Font',

        // Speech
        'speech.disabled': 'Disabled',
        'speech.enabled': 'Enabled',

        // Common
        'common.cancel': 'Cancel',
        'common.save': 'Save',
        'common.edit': 'Edit',
        'common.delete': 'Delete',
        'common.confirm': 'Confirm',
        'common.close': 'Close',
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.success': 'Success',
        'common.warning': 'Warning',
        'common.info': 'Information',
        'common.yes': 'Yes',
        'common.no': 'No',
        'common.ok': 'OK',
        'common.activated': 'Enabled',
        'common.deactivated': 'Disabled',
        'common.page_in_development': 'Page in development',
        'common.error_loading_data': 'Error loading data',

        // Home
        'home.welcome_title': 'Welcome to the Citizen Reporting System',
        'home.welcome_message': 'Report incidents in your city and help improve the quality of life of all citizens.',
        'home.welcome_back': 'Welcome back',
        'home.recent_incidents': 'Recent Incidents',
        'home.recent_incidents_desc': 'Latest incidents reported by citizens',

        // Video
        'video.intro_transcript': 'Welcome to the Citizen Reporting System of the Municipality of Manta. This system allows you to report incidents in your city quickly and easily.',
        'video.download_transcript': 'Download transcript',
        'video.show_captions': 'Show subtitles',
        'video.hide_captions': 'Hide subtitles'
      }
    }
  }

  setupLanguageSelector() {
    const selector = document.getElementById('language-select');
    if (selector) {
      selector.addEventListener('change', (e) => {
        this.setLanguage(e.target.value);
      });
    }
  }

  detectLanguage() {
    const saved = localStorage.getItem('language');
    const browserLang = navigator.language.split('-')[0];
    const detected = saved || (this.translations[browserLang] ? browserLang : 'es');
    this.setLanguage(detected);
  }

  setLanguage(lang) {
    if (!this.translations[lang]) {
      lang = 'es'; // fallback
    }

    this.currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('data-lang', lang);

    const selector = document.getElementById('language-select');
    if (selector) selector.value = lang;

    document.title = this.get('page.title');
    this.updateTexts();

    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
  }

 get(key, params = {}) {
    const translation = this.translations[this.currentLanguage]?.[key] || 
                        this.translations['es']?.[key] || key;
    return Object.keys(params).reduce((text, param) => {
      return text.replace(`{${param}}`, params[param]);
    }, translation);
  }

  updateTexts() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const t = this.get(key);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.hasAttribute('placeholder')) el.placeholder = t;
      } else {
        el.textContent = t;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = this.get(el.getAttribute('data-i18n-placeholder'));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.title = this.get(el.getAttribute('data-i18n-title'));
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
      el.setAttribute('aria-label', this.get(el.getAttribute('data-i18n-aria-label')));
    });

    document.querySelectorAll('option[data-i18n]').forEach(el => {
      el.textContent = this.get(el.getAttribute('data-i18n'));
    });
  }

  observeDOMChanges() {
    const observer = new MutationObserver(() => this.updateTexts());
    observer.observe(document.body, { childList: true, subtree: true });
}

}

// Inicializar
window.i18n = new I18nManager();

document.addEventListener('DOMContentLoaded', () => {
  window.i18n.updateTexts();
});
