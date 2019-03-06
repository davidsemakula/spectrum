// @flow
import styled from 'styled-components';

export const ReactionWrapper = styled.span`
  display: flex;
  flex: 0 1 auto;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  padding: 2px 8px;
  margin-top: 4px;
  background: ${props =>
    props.hasReacted ? props.theme.space.alt : props.theme.bg.wash};
  border: 1px solid
    ${props =>
      props.hasReacted ? props.theme.space.default : props.theme.bg.border};
  color: ${props =>
    props.hasReacted ? props.theme.space.default : props.theme.text.alt};
  align-self: flex-start;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;

  &:hover {
    color: ${props =>
      props.hasReacted ? props.theme.bg.reverse : props.theme.text.secondary};
  }

  .icon {
    color: ${props =>
      props.hasReacted ? props.theme.space.default : props.theme.text.alt};
    margin-right: 4px;
    margin-top: -1px;
  }
`;
