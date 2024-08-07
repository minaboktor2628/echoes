import MentionedUserEmail from "./MentionedTemplate";

export default function Email() {
  return (
    <MentionedUserEmail
      mentionedByUsername={"tracy"}
      username={"mina"}
      postLink={"posts/somet"}
      mentionedByEmail={"something@gmail.com"}
    />
  );
}
