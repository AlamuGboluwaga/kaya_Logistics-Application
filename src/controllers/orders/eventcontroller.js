const { validationResult } = require("express-validator");
const { pool } = require("../../config/server");
const response = require("../../handlers/response");
require("dotenv").config();

class EventController {
  static async tripEventHistory(req, res) {
    try {
      response.success(
        res, 200, 'trip history event', req.tripEventHistory
      )
    }
    catch (err) {
      response.error(
        res, 500, 'internal server error', err.message
      )
    }
  }
  static async addTripEvent(req, res) {
    const currentDay = currentDate()
    const {
      visibilityCheck,
      timestamp,
      remark,
      journeyIssueType,
      arrivedDestination,
      gateInDestinationTimestamp,
      offloadStart,
      offloadEnd,
      offloadAt,
      offloadIssueType,
      orderId,
      tripStatus
    } = req.body;
    let lastRecord = req.existingRecord;
    try {
      await pool.query("UPDATE tbl_kp_orders SET tracker = $1 WHERE id = $2", [
        +tripStatus,
        orderId,
      ]);
      const checkTripEvents = await pool.query('SELECT * FROM tbl_kp_trip_events WHERE "orderId" = $1 AND "currentDay" = $2', [orderId, currentDay])
      if (checkTripEvents.rowCount <= 0) {
        const eventHistory = {
          visibility: [
            ...lastRecord,
            {
              for: visibilityCheck,
              timestamp,
              remark,
            },
          ],
          onJourneyIssue: journeyIssueType,
          arrivedDestination,
          gatedInAtDestination: gateInDestinationTimestamp,
          offloadStart,
          offloadEnd,
          offloadAt,
          offloadIssueType
        }
        const newTripEvent = await pool.query('INSERT INTO tbl_kp_trip_events ("orderId", "currentDay", "eventHistory") VALUES ($1, $2, $3) RETURNING *', [
          orderId, currentDay, JSON.stringify(eventHistory)
        ])
        return response.success(
          res, 201, 'event created', newTripEvent.rows[0]
        )
      }
      else {
        const events = checkTripEvents.rows.pop()
        const existingHistory = events.eventHistory.visibility
        if (currentDay === events.currentDay) {
          const visibilityCheckUpdate = {
            for: visibilityCheck,
            remark,
            timestamp
          }
          const updatedEventInfo = {
            visibility: [
              ...existingHistory,
              visibilityCheckUpdate
            ],
            onJourneyIssue: journeyIssueType,
            arrivedDestination,
            gatedInAtDestination: gateInDestinationTimestamp,
            offloadStart,
            offloadEnd,
            offloadAt,
            offloadIssueType
          }
          const todayTripEventUpdate = await pool.query('UPDATE tbl_kp_trip_events SET "currentDay" = $1, "eventHistory" = $2 WHERE id = $3 RETURNING *', [
            currentDay,
            JSON.stringify(updatedEventInfo),
            events.id
          ])
          return response.success(
            res, 200, 'trip event updated', todayTripEventUpdate.rows[0]
          )
        }
      }
    }
    catch (err) {
      response.error(
        res, 500, 'internal server error', err.message
      )
    }
  }
}


function currentDate() {
  const currentDay = new Date()
  let month = currentDay.getMonth() + 1
  if (month < 10) {
    month = '0' + month.toString()
  }
  let day = currentDay.getDate()
  if (day < 10) {
    day = '0' + day.toString()
  }
  const year = currentDay.getFullYear()
  return `${year}-${month}-${day}`
}

module.exports = EventController;
