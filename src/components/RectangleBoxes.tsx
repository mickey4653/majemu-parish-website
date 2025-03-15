'use client';

interface BoxContent {
  upperText: string;
  bottomText: string;
}

interface RectangleBoxesProps {
  boxes: BoxContent[];
}

export default function RectangleBoxes({ boxes }: RectangleBoxesProps) {
  return (
    <div className="w-full py-12">
      <div className="flex flex-wrap lg:flex-nowrap justify-center gap-2 sm:gap-4 lg:gap-2 max-w-[1512px] mx-auto px-4 sm:px-6 lg:px-8">
        {boxes.map((box, index) => (
          <div
            key={index}
            className={`
              ${index % 2 === 0 ? 'bg-blue-main hover:bg-blue-dark' : 'bg-red-main hover:bg-red-dark'}
              p-6 shadow-lg hover:shadow-xl transition-all duration-300
              flex flex-col justify-center items-center text-center min-h-[143px]
              cursor-pointer hover:-translate-y-1 transform
              w-full sm:w-[calc(50%-1rem)] lg:flex-1
            `}
          >
            <p className="text-red-light text-[11px] font-semibold mb-2">{box.upperText}</p>
            <p className="text-red-light text-[23px] font-medium">{box.bottomText}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 