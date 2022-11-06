window.addEventListener("load", function () { // сделал это и поднял объявление скрипта в хтмле в хедер
	function room_name_to_components(name) { // преобразует название комнаты "Пр2610" в отдельные составляющие (на регулярках), учитывает особенности наименования корпусов
		let place = name.match(/ПР|АВ|ПК|А|Б|В|Н/i)[0].toUpperCase();
		let number = Number(name.match(/\d\d(?=$)/)[0]);
		let floor = Number(name.match(/\d(?=\d\d$)/)[0]);
		let building;

		if (place === ("А" || "Б" || "В" || "Н")){ // проверка на БС
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

		if ((name.match(/\d(?=\d\d\d$)/)[0] !== undefined) && (place === "БС" || place === "ПК")){
			console.log("слишком много цифр"); // нормально обработать ошибку
			return 0;
		}

		return {"place": place, "building": building, "floor": floor, "number": number};
	}

	function map_name_to_components(name) { // преобразует название карты "Пр26" в отдельные составляющие (на регулярках), учитывает особенности наименования корпусов
		let place = name.match(/ПР|АВ|ПК|А|Б|В|Н/i)[0].toUpperCase();
		let floor = Number(name.match(/\d(?=$)/)[0]);
		let building;

		if (place === ("А" || "Б" || "В" || "Н")){ // проверка на БС
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

	function find_room() {
		let input = document.getElementById("searchBox").value;
		for (let room in rooms) {
			if (input.toUpperCase() === rooms[room].name.toUpperCase()){ // туапперкейз чтобы работало и ПР2610 и Пр2610 и пр2610

			}
		}
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
			this.src = "img/" + this.id + ".png";
			this.width = width; // Здесь должно было быть эпичное высчитывание ширины и длины фото по ссылке но это гавно делается только с локальным
			this.height = height; // сервером так что вводим значения в виде аргументов руками (гроб гроб кладбище :((( )

			let components = map_name_to_components(id);

			this.place = components["place"];
			this.building = components["building"];
			this.floor = components["floor"];

			this.buttons = [this.place, this.building, this.floor];
		}
	}

	class room{ //тут просто сделать список с константными значениями для всех комнат (enum rooms ниже)
		name;
		place;
		building;
		floor;
		number;
		lenght_percent;
		width_percent;
		from_left_percent;
		from_top_percent;

		constructor(name, lenght_percent, width_percent, from_left_percent, from_top_percent) {
			let components = room_name_to_components(name);

			this.name = name;
			this.place = components["building"];
			this.building = components["building"];
			this.floor = components["floor"];
			this.number = components["number"];
			this.lenght_percent = lenght_percent; // это для // длина это слева направо
			this.width_percent = width_percent; // подсветки // ширина это сверху вниз
			this.from_left_percent = from_left_percent; // при выборе
			this.from_top_percent = from_top_percent; // комнаты (в процентах от длины, ширины карты)
		}
	}

	let maps = {"А1": new map("А1"),
		"ПК1": new map("ПК1"),
		"АВ11": new map("АВ11"),
		"ПР11": new map("ПР11", 645, 901)}; // тут меняем размеры картинок

	let rooms = {"ПР2110": new room("ПР2110", 10, 5, 30, 70)}; // просто пример

	let current_map = maps["А1"]; // что сейчас выбрано
	let current_place = "БС";
	let current_building = 1;
	let current_floor = 1;

	document.getElementById(current_place).style.backgroundColor = "red";
	document.getElementById("building_" + current_building).style.backgroundColor = "red";
	document.getElementById("floor_" + current_floor).style.backgroundColor = "red"; // чтобы кнопки сразу были красными

	// добавляем слушатель на каждую кнопку корпуса
	document.querySelectorAll("header > div > button").forEach((button) => {
		button.addEventListener("click", ev => {
			if (button.parentElement.className === "place_buttons"){
				document.getElementById(current_place).style.backgroundColor = "#D9D9D9";
				current_place = button.id;
				document.getElementById(current_place).style.backgroundColor = "red";
			}
			if (button.parentElement.className === "building_buttons"){
				document.getElementById("building_" + current_building).style.backgroundColor = "#D9D9D9";
				current_building = button.innerHTML;
				document.getElementById("building_" + current_building).style.backgroundColor = "red";
			}
			if (button.parentElement.className === "floor_buttons"){
				document.getElementById("floor_" + current_floor).style.backgroundColor = "#D9D9D9";
				current_floor = button.innerHTML;
				document.getElementById("floor_" + current_floor).style.backgroundColor = "red";
			}
			document.getElementById("map").src = define_map().src;
		})
	})

	function define_map() {
		for (let map in maps){
			if (maps[map].place === current_place && maps[map].building === current_building && maps[map].floor === current_floor){
				return maps[map];
			}
		}
	}

	// фокус на инпуте при нажатии на лупу
	const searchIcon = document.getElementById("searchIcon");

	searchIcon.addEventListener("click", ev => document.getElementById("searchBox").focus())



	searchIcon.addEventListener("click", find_room)


})

