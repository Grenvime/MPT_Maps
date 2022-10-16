// переключение карты
const buildings = document.querySelectorAll(".buildings div")
// добавляем слушатель на каждую кнопку корпуса
buildings.forEach(building => {
	building.addEventListener("click", ev => {
		console.log(building.id)
		building_name = building.id // название корпуса
		const map = document.getElementById("map")
		map.src = "img/" + building_name + ".png"
	})

})

// фокус на инпуте при нажатии на лупу
const searchIcon = document.getElementById("searchIcon")
searchIcon.addEventListener("click", ev => document.getElementById("searchBox").focus())
