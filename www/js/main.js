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

		if ((name.match(/\d(?=\d\d\d$)/)[0] !== undefined) && (place === ("БС" || "ПК"))){
			console.log("слишком много цифр"); // нормально обработать ошибку
			return 0;
		}

		return {"place": place, "building": building, "floor": floor, "number": number};
	}

	function find_room() {
		let input = document.getElementById("searchBox").value;
		for (let room in rooms) {
			if (input.toUpperCase() === rooms[room].name.toUpperCase()){ // туапперкейз чтобы работало и ПР2610 и Пр2610 и пр2610
				console.log("ae"); // короче ввод через инпут работает, все комнаты вводим в rooms, осталось только подсветить комнату
			}
		}
	}

	class map{ // инфа для корректной работы карты
		id;
		src;
		width_ratio;
		height_ratio;
		button;

		constructor(i, w_r, h_r) {
			this.id = i;
			this.src = "img/" + this.id + ".png";
			this.button = document.getElementById(i);
			this.width_ratio = w_r; // Здесь должно было быть эпичное высчитывание ширины и длины фото по ссылке но это гавно делается только с локальным
			this.height_ratio = h_r; // сервером так что вводим значения в виде аргументов руками (гроб гроб кладбище :((( )
		}
	}

	class room{ //тут просто сделать список с константными значениями для всех комнат (enum rooms ниже)
		name;
		building;
		floor;
		number;
		lenght_percent;
		width_percent;
		from_left_percent;
		from_top_percent;

		constructor(name, l_p, w_p, f_l_p, f_t_p) {
			let components = room_name_to_components(name);

			this.name = name;
			this.building = components["building"];
			this.floor = components["floor"];
			this.number = components["number"];
			this.lenght_percent = l_p; // это для // длина это слева направо
			this.width_percent = w_p; // подсветки // ширина это сверху вниз
			this.from_left_percent = f_l_p; // при выборе
			this.from_top_percent = f_t_p; // комнаты (в процентах от длины, ширины карты)
		}
	}

	let buildings = {BSA: new map("BS", 704, 640), PK: new map("PK"), AV: new map("AV"), PR1: new map("PR")}; // тут меняем размеры картинок

	let rooms = {PR2610: new room("ПР2610", 10, 5, 30, 70)}; // просто пример

	// добавляем слушатель на каждую кнопку корпуса
	for (let building in buildings){
		buildings[building].button.addEventListener("click", ev => {
			document.getElementById("map").src = buildings[building].src;
		})
	}

	// фокус на инпуте при нажатии на лупу
	const searchIcon = document.getElementById("searchIcon");

	searchIcon.addEventListener("click", ev => document.getElementById("searchBox").focus())



	searchIcon.addEventListener("click", find_room)

	// Раз уж назвал buildings, а не places, то пиши туда не места (пряники, бс и т.п.) а корпуса, то есть: ПР1, ПР2, А, Б и т.п., т.к. у них разные карты
})

