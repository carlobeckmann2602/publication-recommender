"use client";

import React, { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TwitterPicker } from "react-color";
import { PUBLICATIONGROUPCOLORS } from "@/constants/colors";
import { useMutation } from "@apollo/client";
import { CreatePublicationGroupDocument } from "@/graphql/mutation/CreatePublicationgroup.generated";
import { allowBackgroundScrolling } from "@/lib/modal-controls";
import { useSession } from "next-auth/react";
import { useFetchPublicationGroups } from "@/hooks/UseFetchPublicationGroups";
import { UpdatePublicationGroupDocument } from "@/graphql/mutation/UpdatePublicationgroup.generated";
import { useToast } from "@/components/ui/use-toast";
import { AddToPublicationGroupDocument } from "@/graphql/mutation/AddToPublicationGroup.generated";
import { PublicationGroupDto } from "@/graphql/types.generated";
import { ToastAction } from "@/components/ui/toast";
import Link from "next/link";

const FormSchema = z.object({
  name: z
    .string({
      required_error: "Name of the group is required",
    })
    .min(1, { message: "Name of the group is required" }),
  color: z.string({
    required_error: "Color for the group is required",
  }),
});

type Props = {
  error?: string;
  id?: string;
  currentName?: string;
  currentColor?: string;
  initialPapers?: string[];
  withNavigation?: boolean;
  onClose?: () => void;
};

export default function PublicationGroupForm(props: Props) {
  const {
    id,
    currentName,
    currentColor,
    initialPapers,
    withNavigation = true,
    onClose,
  } = props;

  const [errorMsg, setErrorMsg] = useState(props.error);
  const router = useRouter();
  const session = useSession();
  const { toast } = useToast();
  const { fetchPublicationGroups } = useFetchPublicationGroups();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      color: PUBLICATIONGROUPCOLORS[0],
    },
  });

  useEffect(() => {
    form.setValue("name", currentName || "");
    form.setValue("color", currentColor || PUBLICATIONGROUPCOLORS[0]);
  }, [form, currentName, currentColor]);

  const [createFunction] = useMutation(CreatePublicationGroupDocument, {
    context: {
      headers: {
        Authorization: `Bearer ${session.data?.userToken.jwtToken}`,
      },
    },
  });

  const [updateFunction] = useMutation(UpdatePublicationGroupDocument, {
    context: {
      headers: {
        Authorization: `Bearer ${session.data?.userToken.jwtToken}`,
      },
    },
  });

  const [addPublicationsToGroupFunction] = useMutation(
    AddToPublicationGroupDocument,
    {
      context: {
        headers: {
          Authorization: `Bearer ${session.data?.userToken.jwtToken}`,
        },
      },
    }
  );

  const addPublicationsToGroup = async (group: PublicationGroupDto) => {
    try {
      let response = await addPublicationsToGroupFunction({
        variables: {
          publicationgroup_id: group.id,
          publication_ids: initialPapers ?? [],
        },
      });

      if (
        response.errors ||
        response.data?.addToPublicationGroup.success === false
      ) {
        toast({
          variant: "destructive",
          title: "An Error occured!",
          description: `Could not add publications to group "${group.name}".`,
        });
        return;
      }

      fetchPublicationGroups();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "An Error occured!",
        description: `Could not add publications to group "${group.name}".`,
      });
    }
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setErrorMsg(undefined);

    if (id) {
      handleUpdate(id, data.name, data.color);
      return;
    }

    handleCreation(data.name, data.color);
  }

  const handleCreation = async (name: string, color: string) => {
    try {
      const response = await createFunction({
        variables: {
          name: name,
          color: color,
        },
      });

      if (response.errors) {
        setErrorMsg("Creation of new group failed!");
        return;
      }

      toast({
        title: `Successfully created group "${name}".`,
        action: !withNavigation ? (
          <ToastAction
            className={buttonVariants({
              variant: "ghost",
            })}
            altText="Go to group"
            asChild
          >
            <Link href={`/groups/${response.data?.createPublicationGroup?.id}`}>
              Go to group
            </Link>
          </ToastAction>
        ) : undefined,
      });

      if (initialPapers && initialPapers.length >= 1) {
        addPublicationsToGroup({
          id: response.data?.createPublicationGroup?.id,
          name: name,
        } as PublicationGroupDto);

        if (initialPapers.length === 1) {
          toast({
            title: `Publication added to group`,
            description: `Successfully added publication to group "${name}".`,
            action: (
              <ToastAction
                className={buttonVariants({
                  variant: "ghost",
                })}
                altText="Go to group"
                asChild
              >
                <Link
                  href={`/groups/${response.data?.createPublicationGroup?.id}`}
                >
                  Go to group
                </Link>
              </ToastAction>
            ),
          });
        } else {
          toast({
            title: `Publications added to group`,
            description: `Successfully added ${initialPapers?.length} publication to group "${name}".`,
            action: !withNavigation ? (
              <ToastAction
                className={buttonVariants({
                  variant: "ghost",
                })}
                altText="Go to group"
                asChild
              >
                <Link
                  href={`/groups/${response.data?.createPublicationGroup?.id}`}
                >
                  Go to group
                </Link>
              </ToastAction>
            ) : undefined,
          });
        }
      }

      fetchPublicationGroups();
      allowBackgroundScrolling();

      if (withNavigation) {
        router.push(`/groups/${response.data?.createPublicationGroup?.id}`);
      }

      if (onClose) {
        onClose();
        return;
      }
    } catch (error: any) {
      console.error(error.message);
      setErrorMsg("An error occured while creating the new group!");
    }
  };

  const handleUpdate = async (id: string, name: string, color: string) => {
    try {
      const response = await updateFunction({
        variables: {
          id: id,
          name: name,
          color: color,
        },
      });

      if (response?.errors) {
        setErrorMsg("Update of group failed!");
        return;
      }

      fetchPublicationGroups();
      allowBackgroundScrolling();

      toast({
        title: `Group "${currentName}" was updated successfully.`,
      });

      if (onClose) {
        onClose();
        return;
      }
    } catch (error: any) {
      console.error(error.message);
      setErrorMsg("An error occured while updating the group!");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Name"
                  type="text"
                  autoComplete="on"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <TwitterPicker
                  className="!border !bg-background !rounded-md !border-input !p-0 !text-sm !ring-offset-background !shadow-none focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 disabled:!cursor-not-allowed disabled:!opacity-50 [&_input]:!w-fit [&_input]:!shadow-none [&_input]:!border [&_input]:!border-solid [&_input]:!border-input"
                  colors={PUBLICATIONGROUPCOLORS}
                  color={field.value}
                  triangle="hide"
                  width="100%"
                  onChangeComplete={(color) => {
                    form.setValue("color", color.hex);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {id ? "Save changes" : "Create Group"}
        </Button>
      </form>
    </Form>
  );
}
