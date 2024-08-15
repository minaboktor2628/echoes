import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

interface FollowTemplateProps {
  username: string;
  followedUsername: string;
  followedByImg: string;
  profileLink: string;
  followedById: string;
  reqOrFollow: "requested to follow" | "followed";
}

const baseUrl = process.env.NEXTAUTH_URL; //"https://echoes-mina.vercel.app";

export const FollowTemplate = ({
  username,
  followedUsername,
  followedById,
  profileLink,
  reqOrFollow,
  followedByImg,
}: FollowTemplateProps) => {
  const previewText = `${followedUsername} ${reqOrFollow} you!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Section className="mt-[32px]">
              <Img
                src={`https://ekkos.vercel.app/apple-touch-icon.png`}
                width="40"
                height="37"
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              <strong>Ekkos</strong>
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              Hello <strong>{username},</strong>
            </Text>
            <Text className="text-[14px] leading-[24px] text-black">
              <strong>{followedUsername}</strong> has {reqOrFollow} you.
            </Text>
            <Section>
              <Row>
                <Column align={"center"}>
                  <Link href={`${baseUrl}/profile/${followedById}`}>
                    <Img
                      width="32"
                      className={"rounded-full"}
                      height="32"
                      src={followedByImg}
                    />
                  </Link>
                  <strong className={"ml-2"}>{followedUsername}</strong>
                </Column>
              </Row>
            </Section>
            <Section className="mb-[32px] mt-[32px] text-center">
              <Button
                className="rounded bg-[#e11d48] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={baseUrl + profileLink}
              >
                Go to profile
              </Button>
            </Section>
            <Text className="text-[14px] leading-[24px] text-black">
              Or copy and paste this URL into your browser:{" "}
              <Link href={profileLink} className="text-blue-600 no-underline">
                {baseUrl + profileLink}
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

FollowTemplate.PreviewProps = {
  followedById: "clzc89iv60000118pw7imgcj6",
  username: "tracy",
  followedUsername: "mina",
  profileLink: `/profile/clzc89iv60000118pw7imgcj6`,
  followedByImg: "",
} as FollowTemplateProps;

export default FollowTemplate;
