// eslint-disable-next-line no-undef
import CalendarEvent = GoogleAppsScript.Calendar.CalendarEvent;

// 実行する status の値
const EXECUTE_STATUS_VALUE = PropertiesService.getScriptProperties().getProperty('EXECUTE_STATUS_VALUE');
// 実行完了後にセットする status の値
const ADDED_STATUS_VALUE = PropertiesService.getScriptProperties().getProperty('ADDED_STATUS_VALUE');
// 登録するカレンダーの ID
const CALENDAR_ID = PropertiesService.getScriptProperties().getProperty('CALENDAR_ID');
// データの入ったシート名
const SHEET_NAME = PropertiesService.getScriptProperties().getProperty('SHEET_NAME');

/**
 * シートのデータをカレンダーに登録する
 */
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
function addEventsToGoogleCalendar (): void {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  for (let rowNumber = 2; rowNumber <= sheet.getLastRow(); rowNumber++) {
    const status = sheet.getRange(rowNumber, 1).getValue();

    if (status !== EXECUTE_STATUS_VALUE) {
      continue;
    }

    let columnNumber = 2;
    const id = sheet.getRange(rowNumber, columnNumber).getValue();
    const summary = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const target = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const eventStartDateValue = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const eventStartTime = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const eventEndDateValue = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const eventEndTime = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const baseDescription = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const limit = sheet.getRange(rowNumber, ++columnNumber).getValue();
    const reference = sheet.getRange(rowNumber, ++columnNumber).getValue();

    const title = buildTitle(summary, target);
    const description = buildDescription(baseDescription, limit, reference);
    const formattedStartDate = Utilities.formatDate(eventStartDateValue, 'Asia/Tokyo', 'yyyy/MM/dd');
    const formattedEndDate = Utilities.formatDate(eventEndDateValue, 'Asia/Tokyo', 'yyyy/MM/dd');

    const startDateTime = eventStartTime === '' ? new Date(formattedStartDate) : getStartDateTime(formattedStartDate, eventStartTime);
    const endDateTime = eventEndTime === '' ? getAllDayEventEndDateTime(formattedEndDate) : getEndDateTime(formattedEndDate, eventEndTime);
    const isAllDayEvent = eventStartTime === '' || eventEndTime === '';

    const calendarEvent = id === ''
      ? createNewCalendarEvent(title, startDateTime, endDateTime, description, isAllDayEvent)
      : updateCalendarEvent(id, title, startDateTime, endDateTime, description, isAllDayEvent);
    calendarEvent.setVisibility(CalendarApp.Visibility.PRIVATE);

    sheet.getRange(rowNumber, 1).setValue(ADDED_STATUS_VALUE);
    sheet.getRange(rowNumber, 2).setValue(calendarEvent.getId());
  }
}

/**
 * カレンダーのタイトルをビルドする.
 *
 * @param {string} summary
 * @param {string} target
 * @returns {string}
 */
function buildTitle (summary: string, target: string): string {
  const trimSummary = summary.trim();
  const trimTarget = target.trim();

  return trimTarget === '' ? trimSummary : `${trimSummary}@${trimTarget}`;
}

/**
 * カレンダーの説明をビルドする
 *
 * @param {string} baseDescription 基本的な説明
 * @param {string} limit 還元上限の説明
 * @param {string} reference 参照のURL
 * @returns {string}
 */
function buildDescription (baseDescription: string, limit: string, reference: string): string {
  let description = baseDescription;

  if (limit !== '') {
    description = `${description}\n還元上限 : ${limit}`;
  }

  if (reference !== '') {
    description = `${description}\nref : ${reference}`;
  }

  return description.trim();
}

/**
 * イベントが開始する日付と時間の Date オブジェクトを取得する
 *
 * @param {string} startDate イベントが開始する日付
 * @param {Date} eventStartTime イベントが開始する時間
 * @returns {Date}
 */
function getStartDateTime (startDate: string, eventStartTime: Date): Date {
  const hours = eventStartTime.getHours();
  const minutes = eventStartTime.getMinutes();
  const seconds = eventStartTime.getSeconds();

  return new Date(`${startDate} ${hours}:${minutes}:${seconds}`);
}

/**
 * 終日イベントが終了する日付と時間の Date オブジェクトを取得する
 *
 * @param {string} endDate イベントが終了する日付
 * @returns {Date}
 */
function getAllDayEventEndDateTime (endDate: string): Date {
  return new Date((new Date(endDate)).getTime() + (1000 * 60 * 60 * 24));
}

/**
 * イベントが終了する日付と時間の Date オブジェクトを取得する
 *
 * @param {string} endDate イベントが終了する日付
 * @param {Date} eventEndTime イベントが終了する時間
 * @returns {Date}
 */
function getEndDateTime (endDate: string, eventEndTime: Date): Date {
  const hours = eventEndTime.getHours();
  const minutes = eventEndTime.getMinutes();
  const seconds = eventEndTime.getSeconds();

  return new Date(`${endDate} ${hours}:${minutes}:${seconds}`);
}

/**
 * カレンダーを新規作成する
 *
 * @param {string} title
 * @param {Date} startDateTime
 * @param {Date} endDateTime
 * @param {string} description
 * @param {boolean} isAllDayEvent
 * @returns {CalendarApp.CalendarEvent}
 */
function createNewCalendarEvent (title: string, startDateTime: Date, endDateTime: Date, description: string, isAllDayEvent: boolean): CalendarEvent {
  const calendar = CalendarApp.getCalendarById(CALENDAR_ID);

  if (isAllDayEvent) {
    return calendar.createAllDayEvent(title, startDateTime, endDateTime, { description });
  } else {
    return calendar.createEvent(title, startDateTime, endDateTime, { description });
  }
}

/**
 * 既存のカレンダーを更新する
 *
 * @param {string} id
 * @param {string} title
 * @param {Date} startDateTime
 * @param {Date} endDateTime
 * @param {string} description
 * @param {boolean} isAllDayEvent
 * @returns {CalendarApp.CalendarEvent}
 */
function updateCalendarEvent (id: string, title: string, startDateTime: Date, endDateTime: Date, description: string, isAllDayEvent: boolean): CalendarEvent {
  const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
  const event = calendar.getEventById(id);

  if (isAllDayEvent) {
    event.setAllDayDates(startDateTime, endDateTime);
  } else {
    event.setTime(startDateTime, endDateTime);
  }

  return event.setTitle(title).setDescription(description);
}
