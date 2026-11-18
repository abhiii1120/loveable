const AuthCards = ({number, text, selected}) => {
  return (
    <div
      className={`${selected ? "bg-background-secondary text-text-inverted" : "border border-border-primary"}   flex flex-col gap-5 p-4 rounded-2xl font-semibold`}
    >
      <div>{number}</div>
      <div>{text}</div>
    </div>
  );
};

export default AuthCards;
