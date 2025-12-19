class FrogServersUI {
    // Загрузить список серверов
    static loadList = async () => { return false; }

    // Скопировать IP сервера (removed)
    static copyServerIP(ip) { /* no-op */ }

    // Получить статус и информацию о сервере (removed)
    static queryServer = async (ip) => { return { online: false }; }

    // Обновить информацию о серверах в списке (removed)
    static refreshServersInfo = () => { /* no-op */ }

    // Играть на сервере (removed)
    static playOnServer = async (ip, versionId) => { return false; }
}