"use client";
import React, { useEffect, useState } from "react";
// Import the CSS module
import styles from "./Table.module.css"; // Ensure the path is correct

// Import necessary components and icons from MUI

import Typography from "@mui/material/Typography";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Box,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import Card from "@mui/material/Card";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import CloseIcon from "@mui/icons-material/Close";
// Import Date/Time pickers and localization provider
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { addShift, getAllShifts, deleteShift } from "../services/shiftService";
import {
  ToastContainer,
  toast,
  Slide,
  Zoom,
  Flip,
  Bounce,
  POSITION,
} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);

const TableCalendar = () => {
  const [showTimingPopup, setShowTimingPopup] = useState(false);
  const [showUpdateTimingPopup, setshowUpdateTimingPopup] = useState(false);
  const [caretakerId, setcaretakerId] = useState();
  const [shift, setShift] = useState({
    caretakerId: "",
    day: [],
    startTime: "",
    endTime: "",
  });
  const [allShiftData, setallShiftData] = useState([]);
  const [startTime, setstartTime] = useState("");
  const [endTime, setendTime] = useState("");

  const resetShiftState = () => {
    setstartTime('')
    setendTime('')
    setShift({
      caretakerId: "",
      day: [],
      startTime: "",
      endTime: "",
    });
  };
  useEffect(() => {
    GetAllShifts();
  }, []);

  const handleClick = (id) => {
    // console.log("e.target.id,setcaretakerId",e)
    setcaretakerId(id);
    setShowTimingPopup(true);
  };

  const handleCancel = () => {
    setShowTimingPopup(false);
    setcaretakerId("");
  };

  const handleChange = (data, name) => {
    // console.log(shift.day);
    // let date_format = new Date(data);
    // let hours = date_format.getHours();
    // const minutes = date_format.getMinutes();
    // const ampm = hours >= 12 ? "PM" : "AM";
    // hours = hours % 12;
    // hours = hours ? hours : 12;
    // const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
    // const formattedTime = hours + ":" + formattedMinutes + " " + ampm;
    // console.log(formattedTime);
    // let time = dayjs(data).format("HH:mm")
    let formattedTime = "";
    let time = "";
    if (data) {
      // Convert data to a Day.js object and format
      time = dayjs(data).format("HH:mm"); // Format to 24-hour time
      // Format the time for display (if needed in AM/PM format)
      const hours = dayjs(data).hour();
      const minutes = dayjs(data).minute();
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12AM
      const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
      formattedTime = `${formattedHours}:${formattedMinutes} ${ampm}`;
    }

    if (name === "startTime") {
      // Check if endTime is set and compare
      if (
        endTime &&
        dayjs(time, "HH:mm").add(15, "minute").isAfter(dayjs(endTime, "HH:mm"))
      ) {
        notify("Shift duration must be more than 15 minutes.");
      }
      if (
        endTime &&
        dayjs(time, "HH:mm").isSameOrBefore(dayjs(startTime, "HH:mm"))
      ) {
        notify("End time must be grater than start time.");
      }
    } else if (name === "endTime") {
      // Ensure endTime is later than startTime
      if (dayjs(time, "HH:mm").isSameOrBefore(dayjs(startTime, "HH:mm"))) {
        notify("End time must be grater than start time.");
      }
      if (
        time &&
        dayjs(startTime, "HH:mm")
          .add(15, "minute")
          .isAfter(dayjs(time, "HH:mm"))
      ) {
        notify("Shift duration must be more than 15 minutes.");
      }
    }

    if (name == "startTime" || name == "endTime") {
      console.log("data", { [name]: formattedTime });
      setShift({ ...shift, [name]: formattedTime });
      if (name == "startTime") {
        setstartTime(time);
      } else if (name == "endTime") {
        setendTime(time);
      }
    } else if (name == "day") {
      console.log("data", { [name]: data });

      setShift((shift) => ({
        ...shift,
        day: shift.day.includes(data.target.value)
          ? shift.day.filter((day) => day !== data.target.value) // Remove if exists
          : [...shift.day, data.target.value], // Add if not exists
      }));
    }
  };

  const AddShift = async (id) => {
    // const covert_string = JSON.stringify()
    // console.log("...AddShift...id",id.target.id)
    if (!caretakerId) {
      console.error("Caretaker ID is not set.");
      return; // Make sure caretakerId is set
    }
    try {
      let params = {
        shift: {
          ...shift,
          caretakerId: caretakerId,
        },
      };

      console.log("params", params);

      const Api = await addShift(params);
      if (Api.status == 200) {
        GetAllShifts();
        setShowTimingPopup(false);
        resetShiftState();
        console.log("Api", Api.data);
        Sucesssnotify(Api.data.message);
      }
    } catch (error) {
      console.log("error", error);
      if (error.response.data.message) {
        notify(error.response.data.message);
        console.log("error", error.response.data.message);
      }
    }
  };

  const GetAllShifts = async () => {
    try {
      const api = await getAllShifts();
      if (api.status == 200) {
        console.log("GetAllShifts......Api", api.data);
        setallShiftData(api.data);
        setShowTimingPopup(false);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const RemoveShift = async (data) => {
    try {
      console.log("shiftid......", data.target.name);
      console.log("shiftid......", data.target.id);
      const Shiftid = data.target.id;
      const api = await deleteShift(Shiftid);

      if (api.status == 204) {
        GetAllShifts();
        Sucesssnotify("Shift Delete Sucessfully.");
      }
    } catch (error) {
      if (error.response.data.message) {
        notify(error.response.data.message);
        console.log("error", error.response.data.message);
      }
      console.log("error", error);
    }
  };

  const UpdateShift = (data) => {
    console.log("UpdateShift id", data.target.id);
  };
  function convertTo12HourFormat(time) {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const suffix = hour >= 12 ? "PM" : "AM";

    // Convert hour to 12-hour format
    const formattedHour = ((hour + 11) % 12) + 1;
    return `${formattedHour}:${minutes} ${suffix}`;
  }

  const notify = (message) =>
    toast.error(message, {
      theme: "colored",
      toastClassName: "custom-toast",
    });

  const Sucesssnotify = (message) =>
    toast.success(message, {
      theme: "colored",
      toastClassName: "custom-toast",
    });

  return (
    <div className={styles.App}>
      <ToastContainer />
      <div className={styles.ManageTimingDiv}>
        <div className={styles.ManageTimingTitle}>
          <Typography variant="h5">Caretakers: Manage timings</Typography>
        </div>
        <Table className={styles.TimingTable}>
          <TableHead>
            <TableRow>
              <TableCell>Care Tacker</TableCell>
              <TableCell>Mon</TableCell>
              <TableCell>Tue</TableCell>
              <TableCell>Wed</TableCell>
              <TableCell>Thu</TableCell>
              <TableCell>Fri</TableCell>
              <TableCell>Sat</TableCell>
              <TableCell>Sun</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allShiftData.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <h2>{item.caretaker.name}</h2>
                </TableCell>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day, idx) => (
                    <TableCell key={idx}>
                      <div>
                        <AddCircleIcon
                          id={item.caretaker.id}
                          className={styles.AddCircleIcon}
                          onClick={() => handleClick(item.caretaker.id)}
                        />
                      </div>
                      {item.shifts.map((data) =>
                        data.day == day ? (
                          <div className={styles.TimingBoxDiv}>
                            <Box
                              className={styles.TimingBox}
                              id={data.id}
                              onClick={UpdateShift}
                            >
                              {convertTo12HourFormat(data.startTime)} -{" "}
                              {convertTo12HourFormat(data.endTime)}{" "}
                              <CloseIcon
                                className={styles.CloseIcon}
                                name={data.id}
                                id={data.id}
                                onClick={RemoveShift}
                              />
                            </Box>
                          </div>
                        ) : (
                          ""
                        )
                      )}
                    </TableCell>
                  )
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {showTimingPopup &&
          allShiftData.map((item, index) => (
            <>
              <div
                className={styles.Overlay}
                onClick={() => handleCancel()}
              ></div>
              <Card className={styles.ShowTimingPopup}>
                <Typography variant="h5" className={styles.ShiftTitle}>
                  New Shift
                </Typography>

                <FormGroup
                  aria-label="position"
                  row
                  className={styles.CheckboxDay}
                >
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day, idx) => (
                      <FormControlLabel
                        name="day"
                        key={idx}
                        value={day}
                        control={
                          <Checkbox className={styles.CheckboxDayShift} />
                        }
                        label={day}
                        labelPlacement="end"
                        onClick={(data) => {
                          handleChange(data, "day");
                        }}
                      />
                    )
                  )}
                </FormGroup>

                <div className={styles.ShiftLabel}>
                  <div className={styles.ShiftTitleName}>Shift Start </div>
                  <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    className={styles.MuiPickersPopper}
                  >
                    <TimePicker
                      label="Shift Start"
                      onChange={(data) => {
                        handleChange(data, "startTime");
                      }}
                      renderInput={(params) => (
                        <TextField {...params} name="startTime" />
                      )}
                      className={styles.MuiPickersPopper}
                    />
                  </LocalizationProvider>
                </div>
                <div className={styles.ShiftLabel}>
                  <div className={styles.ShiftTitleName}>Shift End</div>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      label="Shift End"
                      onChange={(data) => {
                        handleChange(data, "endTime");
                      }}
                      renderInput={(params) => (
                        <TextField {...params} name="endTime" />
                      )}
                    
                      shouldDisableTime={(timeValue, clockType) => {
                        // Check if startTime is not set
                        if (!startTime) {
                          return true; // Disable all times if startTime is not set
                        }

                        // Assuming startTime is a string in "HH:mm" format and dayjs is available
                        const startTimeMoment = dayjs(startTime, "HH:mm");

                        if (clockType === "hours") {
                          // For hours, we only allow the selection of the start hour and the hours after it
                          // to ensure that the end time is after the start time
                          const startHour = startTimeMoment.hour();
                          if (timeValue < startHour) {
                            return true; // Disable hours before the start hour
                          } else if (timeValue === startHour) {
                            // If the hour being selected is the start hour, we need to further check minutes
                            // This check is done in the 'minutes' section below
                            return false;
                          } else {
                            // For hours after the start hour, we don't disable them here
                            // Minute checks will further refine the selection
                            return false;
                          }
                        }
                        return false; // Enable all other times by default
                      }}
                    />
                  </LocalizationProvider>
                </div>
                <div className={styles.ShiftAddButton}>
                  <button
                    id={item.caretaker.id}
                    // id={index}
                    className={styles.AddBtn}
                    // onClick={AddShift}
                    onClick={() => AddShift()}
                  >
                    Add{item.caretaker.id}
                    {console.log("item.caretaker.id", item.caretaker.id)}
                  </button>
                  <button
                    className={styles.CancelBtn}
                    onClick={() => handleCancel()}
                  >
                    Cancel
                  </button>
                </div>
              </Card>
            </>
          ))}
      </div>
    </div>
  );
};

export default TableCalendar;
