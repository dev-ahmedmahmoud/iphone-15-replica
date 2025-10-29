import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { VideoCarousel } from "@/components";

const Highlights: React.FC = () => {
  useGSAP(() => {
    gsap.to("#title", { opacity: 1, y: 0 });
    gsap.to(".link", { opacity: 1, y: 0, duration: 1, stagger: 0.25 });
  }, []);

  return (
    <section
      id="highlights"
      className="w-screen overflow-hidden h-full common-padding bg-zinc"
    >
      <div className="screen-max-width">
        <div className="mb-12 w-full md:flex items-end justify-between">
          <h1 id="title" className="section-heading">
            Get the highlights.
          </h1>

          <div className="flex flex-wrap items-end gap-5">
            <p className="link">
              Watch the film
              <Image
                src={"/assets/images/watch.svg"}
                alt="watch"
                className="ml-2"
                width={16}
                height={16}
              />
            </p>
            <p className="link">
              Watch the event
              <Image
                src={"/assets/images/right.svg"}
                alt="right"
                className="ml-2"
                width={16}
                height={16}
              />
            </p>
          </div>
        </div>

        <VideoCarousel />
      </div>
    </section>
  );
};

export default Highlights;
