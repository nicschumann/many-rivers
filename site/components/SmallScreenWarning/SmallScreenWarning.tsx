export default function SmallScreenWarning() {
  return (
    <div className="block sm:hidden bg-black p-4 text-center w-screen h-screen fixed top-0 left-0 z-20">
      <p className="text-white relative top-[25%]">
        This simulation is resource-intensive and is not intended for small
        screens. Please visit the site on desktop with a larger window size.
      </p>
    </div>
  );
}
