// первый запуск
stateChanged();

/**
 * Клик на элементы (переписать на нужное)
 */
$('.header_list li:nth-child(1) a').click(function (e) {
	e.preventDefault();
	history.pushState(null, null, 'music');
	
	stateChanged();
});

$('.header_list li:nth-child(2) a').click(function (e) {
	e.preventDefault();
	history.pushState(null, null, 'video');
	
	stateChanged();
});

$('.header_logo').click(function (e) {
	e.preventDefault();
	history.pushState(null, null, '/');
	
	stateChanged();
});

/**
 * Нажали на кнопку назад/перед
 * Тут ничего менять не нужно
 */

window.onpopstate = function (event) {
	stateChanged();
};

function stateChanged() {
	var state = location.pathname;
	
	switch (state) {
		case '/music' :
			console.log('music page');
			break;
			
		case '/video' :
			console.log('video page');
			break;
			
		case '/' :
			console.log('main page');
			break;
			
		default:
			console.log('404 error page');
			break;
	}
}