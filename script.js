document.addEventListener('DOMContentLoaded', function () {
    const tg = window.Telegram.WebApp;

    // --- ОБЩАЯ ИНИЦИАЛИЗАЦИЯ ---
    tg.expand(); // Разворачиваем приложение на весь экран
    // Безопасно устанавливаем цвета, только если функции существуют
    if (tg.setHeaderColor) {
        tg.setHeaderColor('secondary_bg_color');
    }
    if (tg.setBgColor) {
        tg.setBgColor(tg.themeParams.bg_color || '#ffffff');
    }
    tg.ready(); // Сообщаем, что приложение готово

    // --- Убираем лоадер через 1.5 секунды ---
    const loader = document.querySelector('.loader-wrapper');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 1500);
    }

    // --- ЛОГИКА ДЛЯ ГЛАВНОЙ СТРАНИЦЫ (КАТАЛОГ) ---
    if (document.body.classList.contains('catalog-page')) {
        tg.BackButton.hide();
        tg.MainButton.hide();

        // Логика поиска
        const searchInput = document.getElementById('searchInput');
        const productsList = document.getElementById('products-list');
        const allProducts = productsList ? Array.from(productsList.getElementsByClassName('product-card')) : [];

        // Скрываем остальные секции при поиске
        const topSellersSection = document.getElementById('top-sellers');
        const specialOffersSection = document.getElementById('special-offers');
        const catalogTitle = document.querySelector('#catalog .section__title');

        searchInput.addEventListener('keyup', function () {
            const query = searchInput.value.toLowerCase().trim();

            if (query.length > 0) {
                // Если есть запрос - скрываем лишние секции
                if (topSellersSection) topSellersSection.style.display = 'none';
                if (specialOffersSection) specialOffersSection.style.display = 'none';
                if (catalogTitle) catalogTitle.style.display = 'none';
            } else {
                // Если запрос пустой - показываем все обратно
                if (topSellersSection) topSellersSection.style.display = 'block';
                if (specialOffersSection) specialOffersSection.style.display = 'block';
                if (catalogTitle) catalogTitle.style.display = 'block';
            }

            allProducts.forEach(card => {
                const productName = card.querySelector('.product-card__name').textContent.toLowerCase();
                if (productName.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // --- ЛОГИКА ДЛЯ СТРАНИЦЫ ТОВАРА ---
    if (document.body.classList.contains('product-page-body')) {
        // Показываем кнопку "Назад"
        tg.BackButton.show();
        tg.BackButton.onClick(() => {
            window.history.back();
        });

        // Настраиваем главную кнопку (купить)
        const priceMainEl = document.querySelector('.price-main');
        const basePrice = parseFloat(priceMainEl.dataset.price);

        function updateMainButton(currentPrice) {
            const formattedPrice = new Intl.NumberFormat('ru-RU').format(currentPrice);
            tg.MainButton.setText(`Купить за ${formattedPrice} сум`);
            tg.MainButton.show();
        }

        function updatePrice() {
            const selectedMemory = document.querySelector('.text-option.active');
            const priceAdd = parseFloat(selectedMemory.dataset.priceAdd);
            const finalPrice = basePrice + priceAdd;

            priceMainEl.textContent = `${new Intl.NumberFormat('ru-RU').format(finalPrice)} сум`;
            updateMainButton(finalPrice);
        }

        // Выбор цвета
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelector('.color-option.active').classList.remove('active');
                option.classList.add('active');

                document.getElementById('main-product-image').src = option.dataset.img;
                document.getElementById('color-name').textContent = option.dataset.colorName;
                tg.HapticFeedback.selectionChanged(); // Тактильный отклик
            });
        });

        // Выбор памяти
        document.querySelectorAll('.text-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelector('.text-option.active').classList.remove('active');
                option.classList.add('active');
                updatePrice(); // Обновляем цену при смене памяти
                tg.HapticFeedback.selectionChanged(); // Тактильный отклик
            });
        });

        // Отправка данных боту при нажатии на "Купить"
        tg.MainButton.onClick(() => {
            const productData = {
                name: document.querySelector('.product-info__title').textContent,
                color: document.querySelector('.color-option.active').dataset.colorName,
                storage: document.querySelector('.text-option.active').textContent,
                price: document.querySelector('.price-main').textContent,
            };

            tg.sendData(JSON.stringify(productData));
            // Можно показать уведомление после отправки
            tg.showAlert('Ваш заказ принят! Менеджер скоро свяжется с вами.');
        });

        // Инициализация цены при загрузке страницы
        updatePrice();
    }
});