window.addEventListener("load", function () { // сделал это и поднял объявление скрипта в хтмле в хедер
	function room_name_to_components(name) { // преобразует название комнаты "Пр2610" в отдельные составляющие (на регулярках), учитывает особенности наименования корпусов
		let place = name.match(/ПР|АВ|ПК|А|Б|В|Н/i)[0].toUpperCase();
		let number = Number(name.match(/\d\d(?=$)/)[0]);
		let floor = Number(name.match(/\d(?=\d\d$)/)[0]);
		let building;

		if (place === "А" || place === "Б" || place === "В" || place === "Н"){ // проверка на БС
			building = place;
			place = "БС";
		}
		else {
			try{
				building = Number(name.match(/\d(?=\d\d\d$)/)[0]);
			}
			catch (e) {
				if (place === "ПК"){
					building = 1;
				}
				else {
					console.log("слишком мало цифр"); // нормально обработать ошибку
					return 0;
				}
			}
		}


		if ((name.match(/\d(?=\d\d\d$)/) !== null) && (place === "БС" || place === "ПК")){
			console.log("слишком много цифр"); // нормально обработать ошибку
			return 0;
		}

		return {"place": place, "building": building, "floor": floor, "number": number};
	}

	function map_name_to_components(name) { // преобразует название карты "Пр26" в отдельные составляющие (на регулярках), учитывает особенности наименования корпусов
		let place = name.match(/ПР|АВ|ПК|А|Б|В|Н/i)[0].toUpperCase();
		let floor = Number(name.match(/\d(?=$)/)[0]);
		let building;

		if (place === "А" || place === "Б" || place === "В" || place === "Н"){ // проверка на БС
			building = place;
			place = "БС";
		}
		else {
			try{
				building = Number(name.match(/\d(?=\d$)/)[0]);
			}
			catch (e) {
				if (place === "ПК"){
					building = 1;
				}
				else {
					console.log("слишком мало цифр"); // нормально обработать ошибку
					return 0;
				}
			}
		}

		if ((name.match(/\d(?=\d$)/) !== null) && (place === "БС" || place === "ПК")){
			console.log("слишком много цифр"); // нормально обработать ошибку
			return 0;
		}

		return {"place": place, "building": building, "floor": floor};
	}

	const room_highlight = document.getElementsByClassName("room_highlight")[0];

	function find_room() {
		let input = document.getElementById("searchBox").value;
		for (let room in rooms) {
			if (input.toUpperCase() === rooms[room].name.toUpperCase()){ // туапперкейз чтобы работало и ПР2610 и Пр2610 и пр2610
				return rooms[room];
			}
		}
	}

	function change_highlight(room) {
		if (window.getComputedStyle(room_highlight).display === "none") { // обычный style.display ищет в стилях установленных во время выполнения программы, чтобы узнать стиль из css надо getComputedStyle()
			room_highlight.style.display = "block";
		}

		room_highlight.style.width = room.width_percent.toString() + "%";
		room_highlight.style.height = room.height_percent.toString() + "%"; // перевести в проценты
		room_highlight.style.left = room.from_left_percent.toString() + "%";
		room_highlight.style.top = room.from_top_percent.toString() + "%";
		room_highlight.style.rotate = room.rotation_degrees.toString() + "deg";
	}

	// все что должно происходить при нажатии лупы
	function do_magick(){
		let room = find_room();
		if (!room) {
			room_highlight.style.display = "none";
			return null;
		}


		if (room.place === current_map.place && room.building === current_map.building && room.floor === current_map.floor){ // если карта уже открыта
			//nothing
		}
		else {
			let map = define_map(room.place, room.building, room.floor);
			console.log(map);
			document.getElementById("map").src = map.src; // если не открыта то открыть
			current_map = map;
		}

		change_highlight(room);
	}

	class map{ // инфа для корректной работы карты
		id;
		src;
		width;
		height;
		place;
		building;
		floor;
		buttons;

		constructor(id, width, height) {
			this.id = id;
			this.src = "img/" + this.id + ".svg";
			this.width = width; // Здесь должно было быть эпичное высчитывание ширины и длины фото по ссылке но это гавно делается только с локальным
			this.height = height; // сервером так что вводим значения в виде аргументов руками (гроб гроб кладбище :((( )

			let components = map_name_to_components(id);

			this.place = components["place"];
			this.building = components["building"];
			this.floor = components["floor"];

			this.buttons = [this.place, this.building, this.floor];
		}
	}

	class room{ //тут просто сделать список с константными значениями для всех комнат (enum rooms ниже) // номер комнаты должен быть двухзначным (не 1 а 01)
		name;
		place;
		building;
		floor;
		number;
		height_percent;
		width_percent;
		from_left_percent;
		from_top_percent;
		rotation_degrees;

		constructor(name, height_percent, width_percent, from_left_percent, from_top_percent, rotation_degrees) {
			let components = room_name_to_components(name);

			this.name = name;
			this.place = components["place"];
			this.building = components["building"];
			this.floor = components["floor"];
			this.number = components["number"];
			this.height_percent = height_percent; // это для
			this.width_percent = width_percent; // подсветки
			this.from_left_percent = from_left_percent; // при выборе
			this.from_top_percent = from_top_percent; // комнаты (в процентах от ширины, высоты карты)
			this.rotation_degrees = rotation_degrees;
		}
	}

	let maps = {"В1": new map("В1"),
		"ПР21": new map("ПР21", 645, 901),
		"Н2": new map("Н2")}; // тут меняем размеры картинок

	let rooms = {"ПР2110": new room("ПР2110", 6.7, 11.8, 40.5, 28.3, 0),
		"В101": new room("В101", 48, 14.75, 1.25, 48, 0),
		"В102": new room("В102", 45, 14.75, 1.25, 4, 0),
		"В103": new room("В103", 35, 19.5, 15.75, 4, 0),
		"В104": new room("В104", 35, 6.5, 35, 4, 0),
		"В105": new room("В105", 35, 12.5, 41.25, 4, 0),
		"В106": new room("В106", 35, 19.25, 53.5, 4, 0),
		"В107": new room("В107", 35, 7.5, 77, 4, 0),
		"В108": new room("В108", 44, 15, 84, 4, 0),
		"В109": new room("В109", 49.5, 15, 84, 47, 0),
		"В110": new room("В110", 34.5, 22.5, 47.25, 52.5, 0),
		"В111": new room("В111", 34.5, 6.5, 41, 52.5, 0),
		"В112": new room("В112", 34.5, 10.5, 30.5, 52.5, 0),}; // просто пример

	let current_map = new map("А1");
	let input_chosen_place = null;
	let input_chosen_building = null;
	let input_chosen_floor = null;

	function define_map(place, building, floor) {
		for (let map in maps){
			if (maps[map].place === place && maps[map].building == building && maps[map].floor === floor){
				return maps[map];
			}
		}
	}

	const place_buttons = document.getElementsByClassName("place_button");
	const building_menus = document.getElementsByClassName("building_buttons_select_container")[0].getElementsByClassName("menu");
	const floor_menus = document.getElementsByClassName("floor_buttons_select_container")[0].getElementsByClassName("menu");
	let nav_place_chosen = null;
	let nav_building_chosen = null;
	let nav_floor_chosen = null;

	for (let button = 0; button < place_buttons.length; button++){
		place_buttons[button].addEventListener("click", ev => {
			nav_building_chosen = null; // при смене места очевидно корпус и этаж сбрасываются
			nav_floor_chosen = null;
			nav_place_chosen = place_buttons[button].id; // это для определения карты
		})
	}

	const building_buttons_select_lines = document.getElementsByClassName("building_buttons_select_line");

	for (let line = 0; line < building_buttons_select_lines.length; line++){
		building_buttons_select_lines[line].addEventListener("click", ev => {
			nav_floor_chosen = null;
			nav_building_chosen = building_buttons_select_lines[line].getElementsByTagName("b")[0].innerText; // это для определения карты

			for (let line2 = 0; line2 < building_buttons_select_lines.length; line2++){ // красим все кружки в белый
				building_buttons_select_lines[line2].getElementsByClassName("circle")[0].style.backgroundColor = "#F0F0F0";
			}

			building_buttons_select_lines[line].getElementsByClassName("circle")[0].style.backgroundColor = "#94F0B9"; // красим нужный кружок
		})
	}

	const floor_buttons_select_lines = document.getElementsByClassName("floor_buttons_select_line");

	for (let line = 0; line < floor_buttons_select_lines.length; line++) {
		floor_buttons_select_lines[line].addEventListener("click", ev => {
			nav_floor_chosen = floor_buttons_select_lines[line].getElementsByTagName("b")[0].innerText; // это для определения карты

			for (let line2 = 0; line2 < floor_buttons_select_lines.length; line2++){ // красим все кружки в белый
				floor_buttons_select_lines[line2].getElementsByClassName("circle")[0].style.backgroundColor = "#F0F0F0";
			}

			floor_buttons_select_lines[line].getElementsByClassName("circle")[0].style.backgroundColor = "#94F0B9"; // красим нужный кружок

			let map = define_map(nav_place_chosen, nav_building_chosen.replace("Корпус ", ""), Number(nav_floor_chosen));
			document.getElementById("map").src = map.src;
			current_map = map;
		})
	}

	document.addEventListener("click", ev => {
		console.log(ev.target);

		for (let menu = 0; menu < building_menus.length; menu++){
			building_menus[menu].style.display = "none";

			if (building_menus[menu].id === nav_place_chosen + "_селектор") {
				building_menus[menu].style.display = "block"; //врубаем нужную
			}
		}
		for (let menu = 0; menu < floor_menus.length; menu++){
			floor_menus[menu].style.display = "none";

			if (floor_menus[menu].id === nav_place_chosen + " " + nav_building_chosen) {
				floor_menus[menu].style.display = "block";
			}
		}
	})


	// фокус на инпуте при нажатии на лупу
	const searchIcon = document.getElementById("searchIcon");

	searchIcon.addEventListener("click", ev => document.getElementById("searchBox").focus())



	searchIcon.addEventListener("click", do_magick)


	// чтобы еще enter можно было прожать
	document.addEventListener("keydown", function (event) {
		if (event.code === "Enter"){
			do_magick();
		}
	})

})

