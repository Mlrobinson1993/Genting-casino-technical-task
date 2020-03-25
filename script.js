const initButton = document.querySelector('.button_init');
initButton.addEventListener('click', init);

async function init() {
	initButton.classList.add('hidden');
	setLoadingSpinner(true);
	await fetchData();
}

async function fetchData() {
	const data = await fetch('https://swapi.co/api/starships');
	const response = await data.json();
	sortData(await response);
}

/*
- convert base data layer to json
- filter starships out which have less than 10 crew members
- fetch data from individual film api
- add all data to refined object containing only required keys and values
- sort data by crew members (high to low)
*/
async function sortData(data) {
	const starShipData = {
		count: data.count,
		results: data.results
			.filter(starship => starship.crew >= 10)
			.map(starship => {
				let filmData = [];
				starship.films.map(filmURL => {
					fetch(filmURL)
						.then(res => res.json())
						.then(data => {
							filmData.push({
								title: data.title,
								director: data.director,
								release_data: data.release_date,
							});
						});
				});

				let ship = {
					name: starship.name,
					model: starship.model,
					crew: starship.crew,
					passengers: starship.passengers,
					films_count: starship.films.length,
					films: filmData,
				};

				return ship;
			})
			.sort((a, b) => (Number(a.crew) > Number(b.crew) ? -1 : 1)),
	};

	displayStarships(await starShipData);
}

/*

- remove loading spinner
- sort data by highest film count, set hasIcon to true if starship has the most / joint most appearances
- add icon for starships with most film appearances
- Insert html for starship information card into DOM
-
*/

const displayStarships = starships => {
	setLoadingSpinner(false);
	const container = document.querySelector('.content_container');
	const { results } = starships;

	results
		.sort((a, b) => {
			if (a.films_count > b.films_count) {
				a.hasIcon = true;
			} else if (a.films_count < b.films_count) {
				a.hasIcon = false;
			} else if (a.films_count === b.films_count) {
				a.hasIcon = true;
				b.hasIcon = true;
			}
		})
		.map(starship => {
			container.insertAdjacentHTML(
				'beforeend',
				`<div class="starship_card">
                    <div class="starship_card-top">
                        <div class="starship_card-titles">
                            <span class="starship_card-name">${starship.name}</span>
                            <span class="starship_card-model">${starship.model}</span>
                        </div>
                        <div class="starship_card-icon">
                            ${starship.hasIcon ? '<i class="fas fa-rocket"></i>' : ''}
                        </div>
                    </div>
                    <div class="starship_card-bottom">
                        <span class="starship_card-statistic">
                            ${shortenNumber(starship.crew)}
                            <span class="starship_card-tag">Crew</span>
                        </span>
                        <span class="starship_card-statistic">
                            ${shortenNumber(starship.passengers)}
                            <span class="starship_card-tag">Passengers</span>
                        </span>
                        <span class="starship_card-statistic">
                            ${shortenNumber(starship.films_count)}
                            <span class="starship_card-tag">Films</span>
                        </span>
                    </div>
                </div>`
			);
		});
};

/*
- show loading spinner if boolean argument is true
- hide loading spinner if boolean argument is false
*/

const setLoadingSpinner = bool => {
	const loadingSpinner = document.querySelector('.spinner');
	if (bool) {
		loadingSpinner.classList.add('visible');
	} else {
		loadingSpinner.classList.remove('visible');
	}
};

const shortenNumber = num => {
	return Math.abs(num) > 999
		? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + 'k'
		: Math.sign(num) * Math.abs(num);
};
