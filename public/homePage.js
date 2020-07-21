'use strict'

const logoutButton = new LogoutButton();
const ratesBoard = new RatesBoard();
const moneyManager = new MoneyManager();
const favoritesWidget = new FavoritesWidget();


// Выход из личного кабинета:
logoutButton.action = () => ApiConnector.logout(response => response.success && location.reload());

// Получение информации о пользователе:
ApiConnector.current(response => response.success && ProfileWidget.showProfile(response.data));

//Получение текущих курсов валюты:
function updateTableRatesBoard(data) {
    ratesBoard.clearTable();
    ratesBoard.fillTable(data);
}

let updateStocks = () => ApiConnector.getStocks(response => response.success && updateTableRatesBoard(response.data));

updateStocks();
setInterval(updateStocks, 60000);

//Пополнение баланса:
function updateMessage(data, success, message) {
    ProfileWidget.showProfile(data);
    moneyManager.setMessage(!success, message);
}
moneyManager.addMoneyCallback = data => ApiConnector.addMoney(data, response => response.success ? 
	updateMessage(response.data, response.success, "Баланс успешно пополнен!") : 
		moneyManager.setMessage(response.success, response.data));

//Конвертирование валюты:
moneyManager.conversionMoneyCallback = data => ApiConnector.convertMoney(data, response => response.success ? 
	updateMessage(response.data, response.success, "Конвертация успешно выполнена!") :
		moneyManager.setMessage(response.success, response.data));

//Перевод валюты:
moneyManager.sendMoneyCallback = data => ApiConnector.transferMoney(data, response => response.success ? 
	updateMessage(response.data, response.success, "Перевод прошел успешно!") :
		moneyManager.setMessage(response.success, response.data));

//Запрос начального списка избранного:
function updateTableFavoritesWidget(data) {
    favoritesWidget.clearTable();
    favoritesWidget.fillTable(data);
    moneyManager.updateUsersList(data);
}

ApiConnector.getFavorites(response => response.success && updateTableFavoritesWidget(response.data));

//Добавление пользователя в список избранных:
favoritesWidget.addUserCallback = data => ApiConnector.addUserToFavorites(data, response => response.success ? 
	updateTableFavoritesWidget(response.data) : moneyManager.setMessage(response.success, response.data));

//Удаление пользователя из избранного:
favoritesWidget.removeUserCallback = data => ApiConnector.removeUserFromFavorites(data, response => response.success ? 
	updateTableFavoritesWidget(response.data) : moneyManager.setMessage(response.success, response.data));