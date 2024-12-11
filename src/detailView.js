import { rootElement } from "./main";
import { getForecastWeather } from "./api";
import {
  formatHourlyTime,
  formatTemperature,
  formatToMilitaryTime,
  get24HoursForecastFromNow,
  getDayOfWeek,
} from "./utils";
import { renderLoadingScreen } from "./loading";
import { getConditionImagePath } from "./conditions";
import { loadMainMenu } from "./mainMenu";

export async function loadDetailView(cityName) {
  renderLoadingScreen("Load Weather for " + cityName + "...");
  const weatherData = await getForecastWeather(cityName);
  renderDetailView(weatherData);
  registerEventListeners();
}

function renderDetailView(weatherData) {
  const { location, current, forecast } = weatherData;
  const currentDay = forecast.forecastday[0];

  const conditionImage = getConditionImagePath(
    current.condition.code,
    current.is_day !== 1
  );

  if (conditionImage) {
    rootElement.style = `--detail-condition-image: url(${conditionImage})`;
    rootElement.classList.add("show-background");
  }

  rootElement.innerHTML =
    getActionBarHtml() +
    getHeaderHtml(
      location.name,
      formatTemperature(current.temp_c),
      current.condition.text,
      formatTemperature(currentDay.day.maxTemp_c),
      formatTemperature(currentDay.day.minTemp_C)
    ) +
    getTodayForecastHtml(
      currentDay.day.condition.text,
      currentDay.day.maxwind_kph,
      forecast.forecastday,
      current.last_updated_epoch
    ) +
    getForecastHtml(forecast.forecastday) +
    getMiniStatsHtml(
      current.humidity,
      current.feelsLike_c,
      currentDay.astro.sunrise,
      currentDay.astro.sunset,
      current.precip__mm,
      current.uvIndex
    );
}

function getActionBarHtml() {
  const backIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
</svg>
`;

  return `
  <div class="action-bar">
    <div class="action-bar__back">${backIcon}</div>
  </div>
  `;
}

function getHeaderHtml(location, currentTemp, condition, maxTemp, minTemp) {
  return `
    <div class="current-weather">
        <h2 class="current-weather__location">${location}</h2>
        <h1 class="current-weather__current-temperature">${currentTemp}°</h1>
        <p class="current-weather__condition">${condition}</p>
        <div class="current-weather__day-temperatures">
          <span class="current-weather__max-temperature">H:${maxTemp}°</span>
          <span class="current-weather__min-temperature">T:${minTemp}°</span>
        </div>
      </div>
    `;
}

function getTodayForecastHtml(
  condition,
  maxWind,
  forecastdays,
  lastUpdatedEpoch
) {
  const hourlyForecastElements = get24HoursForecastFromNow(
    forecastdays,
    lastUpdatedEpoch
  )
    .filter((el) => el !== undefined)
    .map(
      (hour, i) => `
       <div class="hourly-forecast">
            <div class="hourly-forecast__time">${
              i === 0 ? "Now" : formatHourlyTime(hour.time) + " Uhr"
            }</div>
            <img
              src="https:${hour.condition.icon}"
              alt=""
              class="hourly-forecast__icon"
            />
            <div class="hourly-forecast__temperature">${formatTemperature(
              hour.temp_c
            )}</div>
          </div>
    `
    );

  const hourlyForecastHTML = hourlyForecastElements.join("");

  return `
     <div class="today-forecast">
        <div class="today-forecast__conditions">
          Heute ${condition}. Wind bis zu ${maxWind} km/h.
        </div>
        <div class="today-forecast__hours">
         ${hourlyForecastHTML}
        </div>
      </div>
  
  `;
}

function getForecastHtml(forecast) {
  const forecastElements = forecast.map(
    (forecastDay) => `
    <div class="forecast-day">
            <div class="forecast-day__day">${getDayOfWeek(
              forecastDay.date
            )}</div>
            <img
              src="https:${forecastDay.day.condition.icon}"
              alt=""
              class="forecast-day__icon"
            />
            <div class="forecast-day__max-temp">H:${formatTemperature(
              forecastDay.day.maxtemp_c
            )}</div>
            <div class="forecast-day__min-temp">T:${formatTemperature(
              forecastDay.day.mintemp_c
            )}</div>
            <div class="Forecast-day__wind">Wind: ${formatTemperature(
              forecastDay.day.maxwind_kph
            )} km/h</div>
          </div>
    `
  );

  const forecastHtml = forecastElements.join("");

  return `
      <div class="forecast">
        <div class="forecast__title">Vorhersage fur die nachsten 3 tage:</div>
        <div class="forecast__days">
        ${forecastHtml}
        </div>
      </div>
  `;
}

function getMiniStatsHtml(
  humidity,
  feelsLike,
  sunrise,
  sunset,
  precip,
  uvIndex
) {
  return `
  <div class="mini-stats">
        <div class="mini-stat">
          <div class="mini-stat__heading">Feuchtigkeit</div>
          <div class="mini-stat__value">${humidity}</div>
        </div>
          <div class="mini-stat">
          <div class="mini-stat__heading">Gefuhlt</div>
          <div class="mini-stat__value">${feelsLike}</div>
        </div>
          <div class="mini-stat">
          <div class="mini-stat__heading">Feuchtigkeit</div>
          <div class="mini-stat__value">${formatToMilitaryTime(
            sunrise
          )}Uhr</div>
        </div>
          <div class="mini-stat">
          <div class="mini-stat__heading">Feuchtigkeit</div>
          <div class="mini-stat__value">${formatToMilitaryTime(sunset)}</div>
        </div>
          <div class="mini-stat">
          <div class="mini-stat__heading">Feuchtigkeit</div>
          <div class="mini-stat__value">${precip}mm</div>
        </div>
          <div class="mini-stat">
          <div class="mini-stat__heading">Feuchtigkeit</div>
          <div class="mini-stat__value">${uvIndex}</div>
        </div>
      </div>
    `;
}

function registerEventListeners() {
  const backButton = document.querySelector(".action-bar__back");

  backButton.addEventListener("click", () => {
    loadMainMenu();
  });
}
