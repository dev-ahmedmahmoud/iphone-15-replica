import * as THREE from "three";
import { Dispatch, RefObject, SetStateAction, Suspense } from "react";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { OrbitControls, PerspectiveCamera, View } from "@react-three/drei";
import Lights from "./Lights";
import Loader from "./Loader";
import IPhone from "./iPhone";
import { IModel, Size } from "./types";

interface IModelViewProps {
  index: number;
  groupRef: RefObject<THREE.Group<THREE.Object3DEventMap>>;
  gsapType: string;
  controlRef: RefObject<OrbitControlsImpl>;
  setRotationState: Dispatch<SetStateAction<number>>;
  size: Size;
  item: IModel;
}

const ModelView = ({
  index,
  groupRef,
  gsapType,
  controlRef,
  setRotationState,
  size,
  item,
}: IModelViewProps) => {
  return (
    <View
      index={index}
      id={gsapType}
      className={`w-full h-full absolute ${index === 2 ? "right-[-100%]" : ""}`}
    >
      {/* Ambient Light */}
      <ambientLight intensity={0.3} />

      <PerspectiveCamera makeDefault position={[0, 0, 4]} />

      <Lights />

      <OrbitControls
        makeDefault
        ref={controlRef}
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.4}
        target={new THREE.Vector3(0, 0, 0)}
        onEnd={() => setRotationState(controlRef.current.getAzimuthalAngle?.())}
      />

      <group
        ref={groupRef}
        name={`${index === 1} ? 'small' : 'large`}
        position={[0, 0, 0]}
      >
        <Suspense fallback={<Loader />}>
          <IPhone
            scale={index === 1 ? [15, 15, 15] : [17, 17, 17]}
            item={item}
            size={size}
          />
        </Suspense>
      </group>
    </View>
  );
};

export default ModelView;
