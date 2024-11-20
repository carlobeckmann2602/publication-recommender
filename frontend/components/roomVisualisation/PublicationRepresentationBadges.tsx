"use client";

import { useFetchPublicationGroups } from "@/hooks/UseFetchPublicationGroups";
import { useSession } from "next-auth/react";
import { forwardRef, Ref } from "react";
import { Color, DoubleSide, Group, Vector3 } from "three";

type Props = {
  id: string;
  position: Vector3;
};

const PublicationRepresentationBadges = forwardRef(
  function PublicationRepresentationBadges(
    { id, position }: Props,
    ref: Ref<Group>
  ) {
    const { publicationGroups } = useFetchPublicationGroups();
    const session = useSession();

    if (session.status != "authenticated") {
      return;
    }

    const groups = publicationGroups.filter((group) => {
      if (
        group.publications.find((publication) => publication.id === id) !==
        undefined
      ) {
        return group;
      }
    });

    return (
      <group ref={ref} position={position}>
        {groups &&
          groups.map((group, index) => {
            return (
              <mesh key={group?.id} position={[2 * index + 0.2, 0, 0]}>
                <roundedPlaneGeometry args={[1.5, 0.5, 0.25]} />
                <meshStandardMaterial
                  attach="material"
                  color={new Color(group?.color)}
                  side={DoubleSide}
                  toneMapped={false}
                />
              </mesh>
            );
          })}
      </group>
    );
  }
);

export default PublicationRepresentationBadges;
