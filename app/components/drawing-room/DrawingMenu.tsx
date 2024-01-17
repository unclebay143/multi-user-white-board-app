import React, { useState } from "react";
import { DrawingPen } from "./BoardContainer";

type DrawingMenuProp = {
  drawingPen: DrawingPen;
  setDrawingPen: Function;
};

const DEFAULT_COLORS = ["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00"];

const DRAW_SIZES = [
  { size: 1, height: 10, width: 10 },
  { size: 2, height: 15, width: 15 },
  { size: 5, height: 20, width: 20 },
  { size: 10, height: 25, width: 25 },
  { size: 15, height: 30, width: 30 },
  { size: 20, height: 35, width: 35 },
  { size: 50, height: 40, width: 40 },
];

const DrawingMenu = (props: DrawingMenuProp) => {
  const { drawingPen, setDrawingPen } = props;
  const [isEraserActive, setIsEraserActive] = useState<boolean>(false);
  const [previousColor, setPreviousColor] = useState(""); // Store the previous color

  const toggleEraser = () => {
    if (!isEraserActive) {
      // Activate eraser
      setPreviousColor(drawingPen.color);
      setDrawingPen((prevState: DrawingPen) => ({
        ...prevState,
        color: "#ffffff", // Set the eraser color to white
      }));
      setIsEraserActive(true);
    } else {
      // Deactivate eraser
      setDrawingPen((prevState: DrawingPen) => ({
        ...prevState,
        color: previousColor, // Revert to the previous color
      }));
      setIsEraserActive(false);
    }
  };

  const changeColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDrawingPen((prevState: DrawingPen) => ({
      ...prevState,
      color: e.target.value,
    }));
  };

  return (
    <div className='fixed z-10 bottom-0 border-t mx-auto w-full justify-center items-center flex xl:w-auto xl:relative xl:flex-col gap-10 xl:justify-start bg-white xl:rounded-sm p-4'>
      <div className='xl:flex flex-col max-w-[100px] gap-10  bg-white rounded-lg'>
        <div
          className='cursor-pointer flex items-center justify-center h-10 w-10 rounded-full border border-slate-400 opacity-90'
          style={{ background: drawingPen.color }}
        >
          <input
            type='color'
            value={drawingPen.color}
            onChange={changeColor}
            className='appearance-none bg-transparent opacity-90 cursor-pointer border-none h-10 w-10 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none'
          />
        </div>
        {DEFAULT_COLORS.map((color) => (
          <div
            key={color}
            className='hidden xl:flex cursor-pointer h-10 w-10 rounded-full border border-slate-400 opacity-90'
            style={{ background: color }}
            onClick={() => {
              setDrawingPen((prevState: DrawingPen) => ({
                ...prevState,
                color,
              }));
            }}
          />
        ))}
      </div>
      <div className='relative group'>
        <div className='cursor-pointer rounded-full border border-slate-400 text-slate-800 opacity-90 h-10 w-10 flex items-center justify-center group-hover:bg-slate-300'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='w-6 h-6'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42'
            />
          </svg>
        </div>
        <div className='hidden absolute z-10 bottom-10 p-3 rounded-lg border bg-slate-700 justify-center gap-2.5 items-center group-hover:flex flex-col'>
          {DRAW_SIZES.map(({ size, width, height }) => (
            <div
              className='flex gap-2 items-center text-slate-200 justify-start'
              key={size}
            >
              <span className='text-xs'>{size}</span>
              <div
                className='cursor-pointer rounded-full border border-slate-200 opacity-90'
                style={{
                  width,
                  height,
                  background:
                    drawingPen.size === size ? drawingPen.color : "transparent",
                }}
                onClick={() => {
                  setDrawingPen((prevState: DrawingPen) => ({
                    ...prevState,
                    size: Number(size),
                  }));
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div
        className='cursor-pointer rounded-full border border-slate-400 text-slate-800 opacity-90 h-10 w-10 flex items-center justify-center'
        style={{
          background: isEraserActive ? "#cbd5e1" : "transparent",
        }}
        onClick={toggleEraser}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='w-6 h-6'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z'
          />
        </svg>
      </div>
    </div>
  );
};

export default DrawingMenu;
