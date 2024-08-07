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

interface MentionedUserProps {
  username: string;
  mentionedByUsername: string;
  mentionedByEmail: string;
  content: string;
  mentionedByImg: string;
  postLink: string;
  mentionedById: string;
  postedDate: Date;
}

const DateTimeFormater = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
});

const baseUrl = process.env.NEXTAUTH_URL
  ? `https://${process.env.NEXTAUTH_URL}`
  : "";

export const MentionedUserEmail = ({
  username,
  mentionedByUsername,
  mentionedByEmail,
  mentionedById,
  postLink,
  mentionedByImg,
  postedDate,
  content,
}: MentionedUserProps) => {
  const previewText = `You were mentioned by ${mentionedByUsername} in a post`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Section className="mt-[32px]">
              {/*<Img*/}
              {/*  src={`${baseUrl}/static/vercel-logo.png`}*/}
              {/*  width="40"*/}
              {/*  height="37"*/}
              {/*  alt="Vercel"*/}
              {/*  className="mx-auto my-0"*/}
              {/*/>*/}
            </Section>
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              <strong>Echoes</strong>
              {/*Join <strong>{teamName}</strong> on <strong>Vercel</strong>*/}
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              Hello {username},
            </Text>
            <Text className="text-[14px] leading-[24px] text-black">
              <strong>{mentionedByUsername}</strong> (
              <Link
                href={`mailto:${mentionedByEmail}`}
                className="text-blue-600 no-underline"
              >
                {mentionedByEmail}
              </Link>
              ) has mentioned you in a post.
            </Text>
            <Section>
              <Row>
                <Column align={"center"}>
                  <Link href={`${baseUrl}/profile/${mentionedById}`}>
                    <Img
                      width="32"
                      className={"rounded-full"}
                      height="32"
                      src={mentionedByImg}
                    />
                  </Link>
                  <Section>
                    <Section className={"flex flex-grow flex-col"}>
                      <Section className={"flex justify-between gap-1"}>
                        <Section>
                          {/*<UserHoverCard*/}
                          {/*  className={*/}
                          {/*    "-my-2 font-semibold outline-none hover:underline focus-visible:underline"*/}
                          {/*  }*/}
                          {/*  {...user}*/}
                          {/*/>*/}
                          <span className={"text-gray-500"}> - </span>
                          <span className={"text-gray-500"}>
                            {DateTimeFormater.format(postedDate)}
                          </span>
                        </Section>
                      </Section>
                      <Text className={"whitespace-pre-wrap"}>{content}</Text>
                    </Section>
                  </Section>
                </Column>
              </Row>
            </Section>
            <Section className="mb-[32px] mt-[32px] text-center">
              <Button
                className="rounded bg-[#e11d48] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={postLink}
              >
                Go to post
              </Button>
            </Section>
            <Text className="text-[14px] leading-[24px] text-black">
              or copy and paste this URL into your browser:{" "}
              <Link href={postLink} className="text-blue-600 no-underline">
                {baseUrl}
                {postLink}
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

// MentionedUserEmail.PreviewProps = {
//   mentionedByEmail:
// } as MentionedUserProps

export default MentionedUserEmail;
