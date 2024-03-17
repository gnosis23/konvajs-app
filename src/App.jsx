import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Group, Text, Transformer, Rect } from 'react-konva';

function Rectangle({ state, setState, index, isSelected, onSelect }) {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Group
        x={state.x}
        y={state.y}
        draggable
        onDragStart={() => {
          setState({
            ...state,
            isDragging: true,
          });
        }}
        onDragEnd={(e) => {
          setState({
            ...state,
            isDragging: false,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
      >
        <Text y={-20} text={`模块${index + 1}`} />
        <Text x={50} y={-20} text={`(${state.x},${state.y}) ${state.width}x${state.height}`} />
        <Rect
          ref={shapeRef}
          x={0}
          y={0}
          width={state.width} height={state.height} stroke="green"
          onClick={onSelect}
          onTransformEnd={() => {
            // transformer is changing scale of the node
            // and NOT its width or height
            // but in the store we have only width and height
            // to match the data better we will reset scale on transform end
            const node = shapeRef.current;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            // we will reset it back
            node.scaleX(1);
            node.scaleY(1);
            setState({
              ...state,
              x: state.x,
              y: state.y,
              width: Math.round(node.width() * scaleX),
              height: Math.round(node.height() * scaleY),
            });
          }}
        />
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          rotateEnabled={false}
          enabledAnchors={['middle-right', 'bottom-right', 'bottom-center']}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}

function Main() {
  const [rects, setRects] = useState([
    {
      id: 0,
      isDragging: false,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
    }
  ]);
  const [selectedId, setSelectedId] = useState(null);

  const checkDeselect = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) setSelectedId(null);
  };

  const addCanvas = () => {
    setRects(prev => [...prev, {
      id: Date.now(),
      isDragging: false,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
    }])
  }

  const onChange = (index, data) => {
    console.log('onchange', index, data);
    rects[index] = data;
    setRects([...rects])
  }

  return (
    <div>
      <h1>Add To Canvas</h1>
      <button onClick={addCanvas}>Add Item</button>
      <h2>Canvas</h2>
      <div style={{ border: '1px solid #eee' }}>
        <Stage width={window.innerWidth} height={window.innerHeight} onMouseDown={checkDeselect}>
          <Layer>
            {rects.map((rect, index) => (
              <Rectangle
                key={rect.id} state={rect} index={index}
                isSelected={rect.id === selectedId}
                onSelect={() => setSelectedId(rect.id)}
                setState={(data) => onChange(index, data)}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  )
}

export default Main;
