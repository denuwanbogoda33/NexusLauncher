class FrogNews {
    // Получить новости из Nexus Launcher Blogspot feed
    static getNews = async () => {
        if (typeof global === "undefined" || typeof global.BLOGSPOT_FEED_URL === "undefined") {
            return [false, null];
        }
        let [isSuccess, data] = await FrogRequests.get(global.BLOGSPOT_FEED_URL);
        if (!isSuccess || !data || !data.feed || !Array.isArray(data.feed.entry)) {
            return [false, null];
        }
        const entries = data.feed.entry;
        // Преобразуем публикации в формат новостей
        const news = entries.map((e) => {
            const title = (e.title && e.title.$t) ? e.title.$t : "";
            const rawContent = (e.summary && e.summary.$t) ? e.summary.$t : ((e.content && e.content.$t) ? e.content.$t : "");
            let description = rawContent.replace(/<[^>]+>/g, ""); // strip HTML tags
            description = description.split('\n\n')[0] || description; // краткое описание — первый абзац
            if (description.length > 400) description = description.slice(0, 400).trim() + "...";
            const date = e.published && e.published.$t ? new Date(e.published.$t).toLocaleDateString() : "";
            let url = "";
            if (Array.isArray(e.link)) {
                const alt = e.link.find(l => l.rel === 'alternate');
                if (alt) url = alt.href;
            }
            const picture = (e.media$thumbnail && e.media$thumbnail.url) ? e.media$thumbnail.url : "";
            return { title, description, date, url, picture };
        });
        return [true, news];
    }

    // Загрузить новости в UI
    static loadNewsToUI = async () => {
        $(".news .preloader").show();
        $(".news .news-list").hide();
        $(".news .news-list").html("");

        let [isSuccess, news] = await FrogNews.getNews();
        if(!isSuccess || !news){
            $(".news .preloader").hide();
            return false;
        }
        let placeholder = $(".news .placeholder")[0].outerHTML;
        placeholder = placeholder.replace(' placeholder"', "");
        // По placeholder`у добавляем новые элементы
        news.forEach((item) => {
            let preparedPlaceholder = placeholder.replaceAll("$1", item.title).replaceAll("$2", item.description).replaceAll("$3", item.date);
            if (typeof item.url !== "undefined") {
                preparedPlaceholder = preparedPlaceholder.replaceAll("$4", item.url).replace('class="link" style="display: none;"', 'class="link"');
            }
            let backgroundImageCSS = item.picture ? `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.82), rgb(0, 0, 0)), url("${item.picture}")` : "";
            $(".news .news-list").append(preparedPlaceholder);
            if (backgroundImageCSS) {
                $(".news .news-list .news-item:last-child").css("background-image", backgroundImageCSS);
            }
        })
        $(".news .preloader").hide();
        $(".news .news-list").show();
        animateCSSNode($(".news .news-list")[0], "fadeIn");
        return true;
    }
}